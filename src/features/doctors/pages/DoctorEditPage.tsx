import { useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";

import DoctorDetailsSkeleton from "../components/DoctorDetailsSkeleton";
import DoctorForm from "../components/DoctorForm";
import { useDoctor } from "../hooks/useDoctor";
import { useUpdateDoctor } from "../hooks/useUpdateDoctor";
import { doctorsApi } from "../api/doctorsApi";
import type { DoctorFormValues } from "../schemas/doctorSchema";
import type { Doctor, UpdateDoctorPayload } from "../types/doctor.types";

const toFormValues = (doctor: Doctor): DoctorFormValues => ({
  fullName: doctor.fullName,
  gender: doctor.gender,
  dateOfBirth: doctor.dateOfBirth,
  department: doctor.department,
  specialization: doctor.specialization,
  qualification: doctor.qualification,
  registrationNumber: doctor.registrationNumber,
  experienceYears: doctor.experienceYears,
  mobile: doctor.mobile,
  email: doctor.email ?? "",
  address: doctor.address ?? "",
  languagesSpoken: doctor.languagesSpoken.join(", "),
  consultationFee: doctor.consultationFee !== null ? String(doctor.consultationFee) : "",
  workingHours: doctor.workingHours ?? "",
  photoUrl: doctor.photoUrl ?? "",
  joiningDate: doctor.joiningDate ?? "",
  status: doctor.status,
});

const toUpdatePayload = (values: DoctorFormValues): UpdateDoctorPayload => ({
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
  status: values.status ?? "active",
});

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not update the doctor. Please check the form and try again.";
};

const DoctorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doctor, isLoading, isError, refetch } = useDoctor(id);
  const updateDoctor = useUpdateDoctor();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo(() => (doctor ? toFormValues(doctor) : null), [doctor]);

  const handleSubmit = async (values: DoctorFormValues) => {
    if (!id) return;
    setServerError(null);
    try {
      await updateDoctor.mutateAsync({ id, payload: toUpdatePayload(values) });
      navigate(`/doctors/${id}`, {
        replace: true,
        state: { flashMessage: "Doctor details were updated successfully." },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  if (isLoading) {
    return <DoctorDetailsSkeleton />;
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
        Doctor not found, or the request failed. Please try again.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Edit Doctor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Code {doctor?.doctorCode} &bull; {doctor?.registrationNumber}
        </Typography>
      </Box>

      <DoctorForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isSubmitting={updateDoctor.isPending}
        serverError={serverError}
        showStatusField
      />
    </Stack>
  );
};

export default DoctorEditPage;
