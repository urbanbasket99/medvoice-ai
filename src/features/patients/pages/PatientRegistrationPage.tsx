import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

import PatientForm from "../components/PatientForm";
import { useCreatePatient } from "../hooks/useCreatePatient";
import { patientFormDefaultValues } from "../schemas/patientSchema";
import type { PatientFormValues } from "../schemas/patientSchema";
import type { CreatePatientPayload } from "../types/patient.types";

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

const PatientRegistrationPage = () => {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const [serverError, setServerError] = useState<string | null>(null);

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
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Register Patient
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A Medical Record Number (MRN) and Unique Health ID (UHID) are generated automatically on save.
        </Typography>
      </Box>

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
