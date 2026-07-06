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
import PatientDeleteDialog from "../components/PatientDeleteDialog";
import PatientDetailsSkeleton from "../components/PatientDetailsSkeleton";
import PatientSnackbar from "../components/PatientSnackbar";
import PatientStatusChip from "../components/PatientStatusChip";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeletePatient } from "../hooks/useDeletePatient";
import { usePatient } from "../hooks/usePatient";
import { usePatientSnackbar } from "../hooks/usePatientSnackbar";

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

interface PlaceholderSection {
  id: string;
  title: string;
  description: string;
}

/**
 * Timeline, Appointments, Consultations, AI Notes, and Billing are
 * intentionally out of scope for Patient Management Phase 1 — these cards
 * are placeholders reserved for their respective future modules.
 */
const PLACEHOLDER_SECTIONS: PlaceholderSection[] = [
  { id: "timeline", title: "Timeline", description: "Chronological patient activity \u2014 coming soon." },
  {
    id: "appointments",
    title: "Appointments",
    description: "Scheduled and past appointments \u2014 coming soon.",
  },
  { id: "consultations", title: "Consultations", description: "Consultation history \u2014 coming soon." },
  { id: "ai-notes", title: "AI Notes", description: "AI-generated medical notes \u2014 coming soon." },
  { id: "billing", title: "Billing", description: "Invoices and payments \u2014 coming soon." },
];

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("patients:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("patients:delete"));
  const { data: patient, isLoading, isError, refetch } = usePatient(id);
  const deletePatient = useDeletePatient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { snackbar, showSuccess, showError, closeSnackbar } = usePatientSnackbar();

  useConsumeFlashMessage(showSuccess);

  const handleConfirmDeactivate = async () => {
    if (!patient) return;
    try {
      await deletePatient.mutateAsync(patient.id);
      showSuccess(`${patient.fullName} was deactivated.`);
      setConfirmingDelete(false);
    } catch {
      showError(`Could not deactivate ${patient.fullName}. Please try again.`);
    }
  };

  if (isLoading) {
    return <PatientDetailsSkeleton />;
  }

  if (isError || !patient) {
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

  const fullAddress = [
    patient.addressLine1,
    patient.addressLine2,
    patient.city,
    patient.state,
    patient.country,
    patient.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Button
            size="small"
            startIcon={<ArrowBackRoundedIcon fontSize="small" />}
            onClick={() => navigate("/patients")}
            sx={{ mb: 1 }}
          >
            Back to Patients
          </Button>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {patient.fullName}
            </Typography>
            <PatientStatusChip status={patient.status} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            MRN {patient.mrn} &bull; UHID {patient.uhid} &bull; {patient.age} yrs
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {canDelete && patient.status === "active" && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => setConfirmingDelete(true)}
            >
              Deactivate
            </Button>
          )}
          {canUpdate && (
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/patients/${patient.id}/edit`)}
            >
              Edit Patient
            </Button>
          )}
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardHeader title="Personal Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="First Name" value={patient.firstName} />
            <DetailRow label="Middle Name" value={patient.middleName} />
            <DetailRow label="Last Name" value={patient.lastName} />
            <DetailRow label="Date of Birth" value={patient.dateOfBirth} />
            <DetailRow label="Gender" value={patient.gender} />
            <DetailRow label="Blood Group" value={patient.bloodGroup} />
            <DetailRow label="Marital Status" value={patient.maritalStatus} />
            <DetailRow label="Occupation" value={patient.occupation} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Contact & Address" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Mobile" value={patient.mobile} />
            <DetailRow label="Alternate Mobile" value={patient.alternateMobile} />
            <DetailRow label="Email" value={patient.email} />
            <DetailRow label="Address" value={fullAddress || null} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Medical Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Allergies" value={patient.allergies} />
            <DetailRow label="Chronic Conditions" value={patient.chronicConditions} />
            <DetailRow label="Notes" value={patient.notes} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Emergency Contact" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Contact Name" value={patient.emergencyName} />
            <DetailRow label="Relationship" value={patient.emergencyRelation} />
            <DetailRow label="Contact Mobile" value={patient.emergencyMobile} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Insurance Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Provider" value={patient.insuranceProvider} />
            <DetailRow label="Policy / Insurance Number" value={patient.insuranceNumber} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Registration" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Registration Date" value={patient.registrationDate} />
            <DetailRow label="Registered On" value={new Date(patient.createdAt).toLocaleString()} />
            <DetailRow label="Last Updated" value={new Date(patient.updatedAt).toLocaleString()} />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
        {PLACEHOLDER_SECTIONS.map((section) => (
          <Card key={section.id} variant="outlined" sx={{ opacity: 0.7 }}>
            <CardHeader title={section.title} />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <PatientDeleteDialog
        patient={confirmingDelete ? patient : null}
        isDeleting={deletePatient.isPending}
        onConfirm={() => void handleConfirmDeactivate()}
        onClose={() => setConfirmingDelete(false)}
      />
      <PatientSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default PatientDetailsPage;
