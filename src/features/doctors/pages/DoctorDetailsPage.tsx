import type { ReactNode } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth";
import DoctorCard from "../components/DoctorCard";
import DoctorAvailabilityEditor from "../components/DoctorAvailabilityEditor";
import DoctorDeleteDialog from "../components/DoctorDeleteDialog";
import DoctorDetailsSkeleton from "../components/DoctorDetailsSkeleton";
import DoctorSnackbar from "../components/DoctorSnackbar";
import { DEPARTMENT_LABELS } from "../schemas/doctorSchema";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteDoctor } from "../hooks/useDeleteDoctor";
import { useDoctor } from "../hooks/useDoctor";
import { useDoctorSnackbar } from "../hooks/useDoctorSnackbar";

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value ?? "\u2014"}</Typography>
  </Box>
);

const detailGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
} as const;

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? "\u2014" : parsed.toLocaleDateString();
};

const GENDER_LABEL = { male: "Male", female: "Female", other: "Other" } as const;

const DoctorDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("doctors:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("doctors:delete"));
  const { data: doctor, isLoading, isError, refetch } = useDoctor(id);
  const deleteDoctor = useDeleteDoctor();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { snackbar, showSuccess, showError, closeSnackbar } = useDoctorSnackbar();

  useConsumeFlashMessage(showSuccess);

  const handleConfirmDeactivate = async () => {
    if (!doctor) return;
    try {
      await deleteDoctor.mutateAsync(doctor.id);
      showSuccess(`${doctor.fullName} was deactivated.`);
      setConfirmingDelete(false);
    } catch {
      showError(`Could not deactivate ${doctor.fullName}. Please try again.`);
    }
  };

  if (isLoading) {
    return <DoctorDetailsSkeleton />;
  }

  if (isError || !doctor) {
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
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/doctors")}>
          Back to Doctors
        </Button>
        <Box sx={{ flex: 1 }} />
        {canUpdate && (
          <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => navigate(`/doctors/${doctor.id}/edit`)}>
            Edit
          </Button>
        )}
        {canDelete && doctor.status === "active" && (
          <Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmingDelete(true)}>
            Deactivate
          </Button>
        )}
      </Stack>

      <DoctorCard doctor={doctor} />

      <Card variant="outlined">
        <CardHeader title="Personal Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Doctor Code" value={doctor.doctorCode} />
            <DetailRow label="Full Name" value={doctor.fullName} />
            <DetailRow label="Gender" value={GENDER_LABEL[doctor.gender]} />
            <DetailRow label="Date of Birth" value={formatDate(doctor.dateOfBirth)} />
            <DetailRow label="Age" value={doctor.age} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Professional Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Department" value={DEPARTMENT_LABELS[doctor.department]} />
            <DetailRow label="Specialization" value={doctor.specialization} />
            <DetailRow label="Qualification" value={doctor.qualification} />
            <DetailRow label="Registration Number" value={doctor.registrationNumber} />
            <DetailRow label="Experience" value={`${doctor.experienceYears} years`} />
            <DetailRow
              label="Consultation Fee"
              value={doctor.consultationFee !== null ? `\u20B9${doctor.consultationFee.toLocaleString()}` : "\u2014"}
            />
            <DetailRow label="Working Hours" value={doctor.workingHours} />
            <DetailRow label="Joining Date" value={formatDate(doctor.joiningDate)} />
            <DetailRow label="Languages Spoken" value={doctor.languagesSpoken.join(", ") || "\u2014"} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Contact Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Mobile" value={doctor.mobile} />
            <DetailRow label="Email" value={doctor.email} />
            <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
              <DetailRow label="Address" value={doctor.address} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <DoctorAvailabilityEditor doctorId={doctor.id} canUpdate={canUpdate} />

      <DoctorDeleteDialog
        doctor={confirmingDelete ? doctor : null}
        isDeleting={deleteDoctor.isPending}
        onConfirm={() => void handleConfirmDeactivate()}
        onClose={() => setConfirmingDelete(false)}
      />
      <DoctorSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default DoctorDetailsPage;
