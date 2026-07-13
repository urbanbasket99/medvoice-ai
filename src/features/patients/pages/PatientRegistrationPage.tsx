import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

import { PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";

import PatientForm from "../components/PatientForm";
import { patientsApi } from "../api/patientsApi";
import { useCreatePatient } from "../hooks/useCreatePatient";
import { patientFormDefaultValues } from "../schemas/patientSchema";
import type { PatientFormValues } from "../schemas/patientSchema";
import type { CreatePatientPayload, Patient } from "../types/patient.types";

const toCreatePayload = (values: PatientFormValues): CreatePatientPayload => ({
  firstName: values.firstName,
  middleName: values.middleName || null,
  lastName: values.lastName,
  dateOfBirth: values.dateOfBirth,
  gender: values.gender,
  bloodGroup: values.bloodGroup || null,
  maritalStatus: values.maritalStatus || null,
  occupation: values.occupation || null,
  mobile: values.mobile,
  alternateMobile: values.alternateMobile || null,
  email: values.email || null,
  addressLine1: values.addressLine1 || null,
  addressLine2: values.addressLine2 || null,
  city: values.city || null,
  state: values.state || null,
  country: values.country || null,
  postalCode: values.postalCode || null,
  emergencyName: values.emergencyName || null,
  emergencyRelation: values.emergencyRelation || null,
  emergencyMobile: values.emergencyMobile || null,
  insuranceProvider: values.insuranceProvider || null,
  insuranceNumber: values.insuranceNumber || null,
  allergies: values.allergies || null,
  chronicConditions: values.chronicConditions || null,
  notes: values.notes || null,
  registrationDate: values.registrationDate || null,
});

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not register the patient. Please check the form and try again.";
};

type LookupMode = "uhid" | "mrn";

const PatientRegistrationPage = () => {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const [serverError, setServerError] = useState<string | null>(null);

  const [lookupMode, setLookupMode] = useState<LookupMode>("uhid");
  const [lookupValue, setLookupValue] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);

  const handleLookup = async () => {
    const trimmed = lookupValue.trim();
    if (!trimmed) {
      setLookupError(`Enter a ${lookupMode.toUpperCase()} to look up.`);
      return;
    }
    setLookupError(null);
    setFoundPatient(null);
    setLookupLoading(true);
    try {
      const patient = await patientsApi.lookup(
        lookupMode === "uhid" ? { uhid: trimmed } : { mrn: trimmed }
      );
      setFoundPatient(patient);
    } catch (error) {
      setLookupError(extractApiErrorMessage(error, "No matching patient found."));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (values: PatientFormValues) => {
    setServerError(null);
    try {
      const patient = await createPatient.mutateAsync(toCreatePayload(values));
      navigate(`/patients/${patient.id}`, {
        replace: true,
        state: { flashMessage: `${patient.fullName} was registered successfully.` },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Register Patient"
        subtitle="A Medical Record Number (MRN) and Unique Health ID (UHID) are generated automatically on save."
      />

      <Card variant="outlined">
        <CardHeader title="Returning patient?" subheader="Look up an existing record by UHID or MRN before registering." />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                select
                label="Lookup by"
                size="small"
                value={lookupMode}
                onChange={(event) => {
                  setLookupMode(event.target.value as LookupMode);
                  setFoundPatient(null);
                  setLookupError(null);
                }}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="uhid">UHID</MenuItem>
                <MenuItem value="mrn">MRN</MenuItem>
              </TextField>
              <TextField
                label={lookupMode === "uhid" ? "UHID" : "MRN"}
                size="small"
                fullWidth
                value={lookupValue}
                onChange={(event) => setLookupValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleLookup();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={lookupLoading ? <CircularProgress size={16} /> : <SearchRoundedIcon />}
                disabled={lookupLoading}
                onClick={() => void handleLookup()}
                sx={{ whiteSpace: "nowrap" }}
              >
                Lookup
              </Button>
            </Stack>

            {lookupError && <Alert severity="warning">{lookupError}</Alert>}

            {foundPatient && (
              <Alert
                severity="success"
                action={
                  <Button color="inherit" size="small" onClick={() => navigate(`/patients/${foundPatient.id}`)}>
                    Open patient record
                  </Button>
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {foundPatient.fullName}
                </Typography>
                <Typography variant="body2">
                  UHID {foundPatient.uhid} • MRN {foundPatient.mrn}
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      <PatientForm
        defaultValues={patientFormDefaultValues}
        onSubmit={handleSubmit}
        submitLabel="Register Patient"
        isSubmitting={createPatient.isPending}
        serverError={serverError}
      />
    </Stack>
  );
};

export default PatientRegistrationPage;
