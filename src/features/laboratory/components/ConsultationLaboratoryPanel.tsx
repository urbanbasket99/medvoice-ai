import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";
import type { Consultation } from "../../consultations/types/consultation.types";
import { useLabOrders } from "../hooks/useLabOrders";
import { formatDisplayDate, getPriorityChipColor, getStatusChipColor, PRIORITY_LABELS, STATUS_LABELS } from "../utils/laboratoryUtils";

const ConsultationLaboratoryPanel = ({ consultation }: { consultation: Consultation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRead = Boolean(user?.isSuperuser || user?.permissions.includes("laboratory:read"));
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("laboratory:create"));

  const labOrdersQuery = useLabOrders({
    consultationId: consultation.id,
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDir: "desc",
  });

  if (!canRead) return null;

  const labOrders = labOrdersQuery.data?.items ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ScienceRoundedIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Laboratory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order laboratory tests or view existing orders for this consultation.
                </Typography>
              </Box>
            </Stack>
            {canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate(`/laboratory/orders/new?consultationId=${consultation.id}`)}
              >
                Order Laboratory Tests
              </Button>
            )}
          </Stack>

          {labOrdersQuery.isLoading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading lab orders…
              </Typography>
            </Stack>
          )}

          {labOrdersQuery.isError && (
            <Alert severity="error" action={<Button onClick={() => void labOrdersQuery.refetch()}>Retry</Button>}>
              Could not load lab orders.
            </Alert>
          )}

          {!labOrdersQuery.isLoading && !labOrdersQuery.isError && labOrders.length === 0 && (
            <Alert severity="info">No lab orders yet for this consultation.</Alert>
          )}

          {labOrders.length > 0 && (
            <List dense disablePadding>
              {labOrders.map((labOrder) => (
                <ListItem
                  key={labOrder.id}
                  secondaryAction={
                    <Button
                      size="small"
                      startIcon={<VisibilityRoundedIcon />}
                      onClick={() => navigate(`/laboratory/orders/${labOrder.id}`)}
                    >
                      View
                    </Button>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {labOrder.orderNumber}
                        </Typography>
                        <Chip size="small" label={PRIORITY_LABELS[labOrder.priority]} color={getPriorityChipColor(labOrder.priority)} />
                        <Chip size="small" label={STATUS_LABELS[labOrder.status]} color={getStatusChipColor(labOrder.status)} />
                      </Stack>
                    }
                    secondary={`${labOrder.items.length} test(s) • ${formatDisplayDate(labOrder.createdAt.slice(0, 10))}`}
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

export default ConsultationLaboratoryPanel;
