import { useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";

import PatientDetailsSkeleton from "../components/PatientDetailsSkeleton";
import PatientForm from "../components/PatientForm";
import { usePatient } from "../hooks/usePatient";
import { useUpdatePatient } from "../hooks/useUpdatePatient";
import type { PatientFormValues } from "../schemas/patientSchema";
import type { Patient, UpdatePatientPayload } from "../types/patient.types";

const toFormValues = (patient: Patient): PatientFormValues => ({
  firstName: patient.firstName,
  middleName: patient.middleName ?? "",
  lastName: patient.lastName,
  dateOfBirth: patient.dateOfBirth,
  gender: patient.gender,
  bloodGroup: patient.bloodGroup ?? "",
  maritalStatus: patient.maritalStatus ?? "",
  occupation: patient.occupation ?? "",
  mobile: patient.mobile,
  alternateMobile: patient.alternateMobile ?? "",
  email: patient.email ?? "",
  addressLine1: patient.addressLine1 ?? "",
  addressLine2: patient.addressLine2 ?? "",
  city: patient.city ?? "",
  state: patient.state ?? "",
  country: patient.country ?? "",
  postalCode: patient.postalCode ?? "",
  allergies: patient.allergies ?? "",
  chronicConditions: patient.chronicConditions ?? "",
  notes: patient.notes ?? "",
  emergencyName: patient.emergencyName ?? "",
  emergencyRelation: patient.emergencyRelation ?? "",
  emergencyMobile: patient.emergencyMobile ?? "",
  insuranceProvider: patient.insuranceProvider ?? "",
  insuranceNumber: patient.insuranceNumber ?? "",
  registrationDate: patient.registrationDate ?? "",
  status: patient.status,
});

const toUpdatePayload = (values: PatientFormValues): UpdatePatientPayload => ({
  firstName: values.firstName,
  middleName: values.middleName || null,
  lastName: values.lastName,
  dateOfBirth: values.dateOfBirth,
  gender: values.gender,
  status: values.status ?? "active",
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
  return detail ?? "Could not update the patient. Please check the form and try again.";
};

const PatientEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading, isError, refetch } = usePatient(id);
  const updatePatient = useUpdatePatient();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo(() => (patient ? toFormValues(patient) : null), [patient]);

  const handleSubmit = async (values: PatientFormValues) => {
    if (!id) return;
    setServerError(null);
    try {
      await updatePatient.mutateAsync({ id, payload: toUpdatePayload(values) });
      navigate(`/patients/${id}`, {
        replace: true,
        state: { flashMessage: "Patient details were updated successfully." },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  if (isLoading) {
    return <PatientDetailsSkeleton />;
  }

  if (isError || !defaultValues) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Patient not found, or the request failed. Please try again.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Edit Patient
        </Typography>
        <Typography variant="body2" color="text.secondary">
          MRN {patient?.mrn} &bull; UHID {patient?.uhid}
        </Typography>
      </Box>

      <PatientForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isSubmitting={updatePatient.isPending}
        serverError={serverError}
        showStatusField
      />
    </Stack>
  );
};

export default PatientEditPage;
