import { useEffect, useState } from "react";
import { Alert, Autocomplete, Button, MenuItem, Stack, TextField } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { doctorsApi } from "../../doctors/api/doctorsApi";
import { patientsApi } from "../../patients/api/patientsApi";
import { ipdApi } from "../api/ipdApi";
import { availableBedsQueryOptions, ipdQueryKeys, wardsListQueryOptions } from "../api/ipdQueries";
import type { AdmissionType, CreateAdmissionPayload } from "../types/ipd.types";

interface EntityOption {
  id: string;
  label: string;
}

const ADMISSION_TYPES: AdmissionType[] = ["emergency", "planned", "transfer"];

const emptyForm = (): CreateAdmissionPayload => ({
  patientId: "",
  admittingDoctorId: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  admissionType: "planned",
  consultationId: "",
  bedId: "",
  expectedDischargeDate: "",
  chiefComplaint: "",
  diagnosis: "",
  notes: "",
});

const AdmissionCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateAdmissionPayload>(emptyForm());
  const [wardFilter, setWardFilter] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<EntityOption | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<EntityOption | null>(null);

  const wardsQuery = useQuery(wardsListQueryOptions({ page: 1, pageSize: 200, isActive: true }));
  const availableBedsQuery = useQuery(availableBedsQueryOptions(wardFilter || undefined));

  const patientsQuery = useQuery({
    queryKey: ["ipd", "patient-search", patientQuery],
    queryFn: () => patientsApi.search({ query: patientQuery, page: 1, pageSize: 10 }),
    enabled: patientQuery.trim().length > 0,
  });

  const doctorsQuery = useQuery({
    queryKey: ["ipd", "doctor-search", doctorQuery],
    queryFn: () => doctorsApi.search({ query: doctorQuery, page: 1, pageSize: 10 }),
    enabled: doctorQuery.trim().length > 0,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, bedId: "" }));
  }, [wardFilter]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, patientId: selectedPatient?.id ?? "" }));
  }, [selectedPatient]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, admittingDoctorId: selectedDoctor?.id ?? "" }));
  }, [selectedDoctor]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdmissionPayload) => ipdApi.createAdmission(payload),
    onSuccess: (admission) => {
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.admissions() });
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.beds() });
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.wards() });
      navigate(`/ipd/admissions/${admission.id}`, {
        replace: true,
        state: { flashMessage: "Admission created successfully." },
      });
    },
  });

  const patientOptions =
    patientsQuery.data?.items.map((patient) => ({
      id: patient.id,
      label: `${patient.fullName} (${patient.uhid})`,
    })) ?? [];

  const doctorOptions =
    doctorsQuery.data?.items.map((doctor) => ({
      id: doctor.id,
      label: `${doctor.fullName} (${doctor.doctorCode})`,
    })) ?? [];

  const handleSubmit = async () => {
    if (!form.patientId || !form.admittingDoctorId) {
      setFormError("Patient and admitting doctor are required.");
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync(form);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not create admission."));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="New IPD Admission"
        subtitle="Admit a patient and optionally assign a bed."
        backAction={
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/ipd/admissions")}>
            Back to admissions
          </Button>
        }
      />

      <Stack spacing={2} sx={{ maxWidth: 760 }}>
        {formError && <Alert severity="error">{formError}</Alert>}

        <Autocomplete
          options={patientOptions}
          value={selectedPatient}
          onChange={(_, option) => setSelectedPatient(option)}
          inputValue={patientQuery}
          onInputChange={(_, value) => setPatientQuery(value)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Patient" size="small" placeholder="Search by name or UHID" required />
          )}
        />

        <Autocomplete
          options={doctorOptions}
          value={selectedDoctor}
          onChange={(_, option) => setSelectedDoctor(option)}
          inputValue={doctorQuery}
          onInputChange={(_, value) => setDoctorQuery(value)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Admitting doctor" size="small" placeholder="Search by name or code" required />
          )}
        />

        <TextField
          select
          label="Admission type"
          size="small"
          fullWidth
          value={form.admissionType}
          onChange={(event) => setForm((prev) => ({ ...prev, admissionType: event.target.value as AdmissionType }))}
        >
          {ADMISSION_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Ward (for bed selection)"
          size="small"
          fullWidth
          value={wardFilter}
          onChange={(event) => setWardFilter(event.target.value)}
          helperText="Optional — filter available beds by ward."
        >
          <MenuItem value="">Any ward</MenuItem>
          {(wardsQuery.data?.items ?? []).map((ward) => (
            <MenuItem key={ward.id} value={ward.id}>
              {ward.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Bed"
          size="small"
          fullWidth
          value={form.bedId ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, bedId: event.target.value }))}
          disabled={availableBedsQuery.isFetching}
          helperText="Optional — leave empty to admit without assigning a bed."
        >
          <MenuItem value="">No bed assigned</MenuItem>
          {(availableBedsQuery.data ?? []).map((bed) => (
            <MenuItem key={bed.id} value={bed.id}>
              {bed.wardName ? `${bed.wardName} — ` : ""}
              {bed.bedNumber}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Consultation ID (optional)"
          size="small"
          fullWidth
          value={form.consultationId ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, consultationId: event.target.value }))}
        />

        <TextField
          label="Admission date"
          type="date"
          size="small"
          fullWidth
          value={form.admissionDate}
          onChange={(event) => setForm((prev) => ({ ...prev, admissionDate: event.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Expected discharge date"
          type="date"
          size="small"
          fullWidth
          value={form.expectedDischargeDate ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, expectedDischargeDate: event.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Chief complaint"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={form.chiefComplaint ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, chiefComplaint: event.target.value }))}
        />

        <TextField
          label="Diagnosis"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={form.diagnosis ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
        />

        <TextField
          label="Notes"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={form.notes ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
        />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => void handleSubmit()} disabled={createMutation.isPending}>
            Create admission
          </Button>
          <Button variant="outlined" onClick={() => navigate("/ipd/admissions")}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AdmissionCreatePage;
