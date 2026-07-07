import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

import DoctorForm from "../components/DoctorForm";
import { useCreateDoctor } from "../hooks/useCreateDoctor";
import { doctorsApi } from "../api/doctorsApi";
import { doctorFormDefaultValues } from "../schemas/doctorSchema";
import type { DoctorFormValues } from "../schemas/doctorSchema";
import type { CreateDoctorPayload } from "../types/doctor.types";

const toCreatePayload = (values: DoctorFormValues): CreateDoctorPayload => ({
  fullName: values.fullName,
  gender: values.gender,
  dateOfBirth: values.dateOfBirth,
  department: values.department,
  specialization: values.specialization,
  qualification: values.qualification,
  registrationNumber: values.registrationNumber,
  experienceYears: values.experienceYears,
  mobile: values.mobile,
  email: values.email || null,
  address: values.address || null,
  languagesSpoken: doctorsApi.parseLanguages(values.languagesSpoken),
  consultationFee: values.consultationFee ? Number(values.consultationFee) : null,
  workingHours: values.workingHours || null,
  photoUrl: values.photoUrl || null,
  joiningDate: values.joiningDate || null,
});

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not register the doctor. Please check the form and try again.";
};

const DoctorRegistrationPage = () => {
  const navigate = useNavigate();
  const createDoctor = useCreateDoctor();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: DoctorFormValues) => {
    setServerError(null);
    try {
      const doctor = await createDoctor.mutateAsync(toCreatePayload(values));
      navigate(`/doctors/${doctor.id}`, {
        replace: true,
        state: { flashMessage: `${doctor.fullName} was registered successfully.` },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Register Doctor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A Doctor Code is generated automatically on save.
        </Typography>
      </Box>

      <DoctorForm
        defaultValues={doctorFormDefaultValues}
        onSubmit={handleSubmit}
        submitLabel="Register Doctor"
        isSubmitting={createDoctor.isPending}
        serverError={serverError}
      />
    </Stack>
  );
};

export default DoctorRegistrationPage;
