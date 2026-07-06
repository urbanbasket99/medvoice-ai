import {
  Alert,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";

import { useRecentPatients } from "../hooks/useDashboardData";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import type { ClinicalAcuity } from "../types/dashboard.types";

const ACUITY_VARIANT: Record<ClinicalAcuity, "clinicalNormal" | "clinicalAbnormal" | "clinicalCritical"> = {
  normal: "clinicalNormal",
  abnormal: "clinicalAbnormal",
  critical: "clinicalCritical",
};

const ACUITY_LABEL: Record<ClinicalAcuity, string> = {
  normal: "Stable",
  abnormal: "Follow-up",
  critical: "Critical",
};

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const RecentPatientsCard = () => {
  const { data: patients, isLoading, error } = useRecentPatients();

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="Recent Patients" subheader="Most recently seen" />
      <Divider />
      <CardContent>
        {error && <Alert severity="error">{error}</Alert>}

        {!error && (isLoading || !patients) && (
          <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          </Stack>
        )}

        {!error && patients && (
          <List disablePadding>
            {patients.map((patient, index) => (
              <ListItem
                key={patient.id}
                disableGutters
                divider={index < patients.length - 1}
                sx={{ py: 1.25 }}
                secondaryAction={
                  <Chip size="small" label={ACUITY_LABEL[patient.acuity]} variant={ACUITY_VARIANT[patient.acuity]} />
                }
              >
                <ListItemAvatar>
                  <Avatar>{getInitials(patient.displayName)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={patient.displayName}
                  secondary={`${patient.reasonForVisit} \u2022 ${formatRelativeTime(patient.lastVisitAt)}`}
                  sx={{ pr: 10 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPatientsCard;
