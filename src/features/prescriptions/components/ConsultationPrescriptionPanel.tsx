import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";
import type { Consultation } from "../../consultations/types/consultation.types";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { formatDisplayDate } from "../utils/prescriptionUtils";

const ConsultationPrescriptionPanel = ({ consultation }: { consultation: Consultation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRead = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:read"));
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:create"));

  const prescriptionsQuery = usePrescriptions({
    consultationId: consultation.id,
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDir: "desc",
  });

  if (!canRead) return null;

  const prescriptions = prescriptionsQuery.data?.items ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <MedicationRoundedIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Prescriptions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View or create prescriptions linked to this consultation.
                </Typography>
              </Box>
            </Stack>
            {canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate(`/prescriptions/new?consultationId=${consultation.id}`)}
              >
                New Prescription
              </Button>
            )}
          </Stack>

          {prescriptionsQuery.isLoading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading prescriptions…
              </Typography>
            </Stack>
          )}

          {prescriptionsQuery.isError && (
            <Alert severity="error" action={<Button onClick={() => void prescriptionsQuery.refetch()}>Retry</Button>}>
              Could not load prescriptions.
            </Alert>
          )}

          {!prescriptionsQuery.isLoading && !prescriptionsQuery.isError && prescriptions.length === 0 && (
            <Alert severity="info">No prescriptions yet for this consultation.</Alert>
          )}

          {prescriptions.length > 0 && (
            <List dense disablePadding>
              {prescriptions.map((prescription) => (
                <ListItem
                  key={prescription.id}
                  secondaryAction={
                    <Button
                      size="small"
                      startIcon={<VisibilityRoundedIcon />}
                      onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                    >
                      View
                    </Button>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemText
                    primary={prescription.diagnosis || "Prescription"}
                    secondary={`${prescription.items.length} medicine(s) • ${formatDisplayDate(prescription.createdAt.slice(0, 10))}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConsultationPrescriptionPanel;
