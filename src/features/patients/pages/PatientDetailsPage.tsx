import type { ReactNode } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth";
import { useAppointments } from "../../appointments/hooks/useAppointments";
import { useConsultations } from "../../consultations/hooks/useConsultations";
import { useInvoices } from "../../billing/hooks/useInvoices";
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

const formatShortDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

interface ChartSectionProps {
  title: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  emptyMessage: string;
  children: ReactNode;
  viewAllHref?: string;
}

const ChartSection = ({
  title,
  loading,
  error,
  onRetry,
  emptyMessage,
  children,
  viewAllHref,
}: ChartSectionProps) => (
  <Card variant="outlined">
    <CardHeader
      title={title}
      action={
        viewAllHref ? (
          <Button size="small" component={RouterLink} to={viewAllHref}>
            View all
          </Button>
        ) : undefined
      }
    />
    <Divider />
    <CardContent>
      {loading ? (
        <Stack sx={{ alignItems: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          Could not load {title.toLowerCase()}.
        </Alert>
      ) : (
        children ?? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        )
      )}
    </CardContent>
  </Card>
);

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("patients:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("patients:delete"));
  const canReadAppointments = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:read"));
  const canReadConsultations = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:read"));
  const canReadBilling = Boolean(user?.isSuperuser || user?.permissions.includes("billing:read"));

  const { data: patient, isLoading, isError, refetch } = usePatient(id);
  const deletePatient = useDeletePatient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { snackbar, showSuccess, showError, closeSnackbar } = usePatientSnackbar();

  const appointmentsQuery = useAppointments({ patientId: id, page: 1, pageSize: 5 });
  const consultationsQuery = useConsultations({ patientId: id, page: 1, pageSize: 5 });
  const invoicesQuery = useInvoices({ patientId: id, page: 1, pageSize: 5 });

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

  const appointments = appointmentsQuery.data?.items ?? [];
  const consultations = consultationsQuery.data?.items ?? [];
  const invoices = invoicesQuery.data?.items ?? [];

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/patients")}>
          Back to Patients
        </Button>
        <Box sx={{ flex: 1 }} />
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

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
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
        {canReadAppointments && (
          <ChartSection
            title="Appointments"
            loading={appointmentsQuery.isLoading}
            error={appointmentsQuery.isError}
            onRetry={() => void appointmentsQuery.refetch()}
            emptyMessage="No appointments for this patient."
            viewAllHref="/appointments"
          >
            {appointments.length > 0 ? (
              <List dense disablePadding>
                {appointments.map((appointment) => (
                  <ListItem key={appointment.id} disableGutters>
                    <ListItemText
                      primary={
                        <Link component={RouterLink} to={`/appointments/${appointment.id}`} underline="hover">
                          {appointment.appointmentNumber}
                        </Link>
                      }
                      secondary={`${formatShortDate(appointment.appointmentDate)} • ${appointment.appointmentTime} • ${appointment.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : null}
          </ChartSection>
        )}

        {canReadConsultations && (
          <ChartSection
            title="Consultations"
            loading={consultationsQuery.isLoading}
            error={consultationsQuery.isError}
            onRetry={() => void consultationsQuery.refetch()}
            emptyMessage="No consultations for this patient."
            viewAllHref="/consultations"
          >
            {consultations.length > 0 ? (
              <List dense disablePadding>
                {consultations.map((consultation) => (
                  <ListItem key={consultation.id} disableGutters>
                    <ListItemText
                      primary={
                        <Link component={RouterLink} to={`/consultations/${consultation.id}`} underline="hover">
                          {consultation.visitNumber}
                        </Link>
                      }
                      secondary={`${consultation.doctorName ?? "Doctor"} • ${consultation.status}${
                        consultation.diagnosis ? ` • ${consultation.diagnosis}` : ""
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : null}
          </ChartSection>
        )}

        {canReadBilling && (
          <ChartSection
            title="Billing"
            loading={invoicesQuery.isLoading}
            error={invoicesQuery.isError}
            onRetry={() => void invoicesQuery.refetch()}
            emptyMessage="No invoices for this patient."
            viewAllHref="/billing/invoices"
          >
            {invoices.length > 0 ? (
              <List dense disablePadding>
                {invoices.map((invoice) => (
                  <ListItem key={invoice.id} disableGutters>
                    <ListItemText
                      primary={
                        <Link component={RouterLink} to={`/billing/invoices/${invoice.id}`} underline="hover">
                          {invoice.invoiceNumber}
                        </Link>
                      }
                      secondary={`${formatShortDate(invoice.invoiceDate)} • ${invoice.status} • ₹${invoice.grandTotal}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : null}
          </ChartSection>
        )}

        <Card variant="outlined" sx={{ opacity: 0.7 }}>
          <CardHeader title="Timeline" />
          <Divider />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Chronological patient activity — coming soon.
            </Typography>
          </CardContent>
        </Card>
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
