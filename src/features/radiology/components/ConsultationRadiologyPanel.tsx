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

import RadiologyRoundedIcon from "../icons/RadiologyRoundedIcon";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import { useNavigate } from "react-router-dom";



import { useAuth } from "../../auth";

import type { Consultation } from "../../consultations/types/consultation.types";

import { useRadiologyOrders } from "../hooks/useRadiologyOrders";

import { formatDisplayDate, getPriorityChipColor, getStatusChipColor, PRIORITY_LABELS, STATUS_LABELS } from "../utils/radiologyUtils";



const ConsultationRadiologyPanel = ({ consultation }: { consultation: Consultation }) => {

  const navigate = useNavigate();

  const { user } = useAuth();

  const canRead = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:read"));

  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:create"));



  const radiologyOrdersQuery = useRadiologyOrders({

    consultationId: consultation.id,

    page: 1,

    pageSize: 10,

    sortBy: "created_at",

    sortDir: "desc",

  });



  if (!canRead) return null;



  const radiologyOrders = radiologyOrdersQuery.data?.items ?? [];



  return (

    <Card variant="outlined">

      <CardContent>

        <Stack spacing={2}>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>

              <RadiologyRoundedIcon color="primary" />

              <Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>

                  Radiology

                </Typography>

                <Typography variant="body2" color="text.secondary">

                  Order imaging studies or view existing orders for this consultation.

                </Typography>

              </Box>

            </Stack>

            {canCreate && (

              <Button

                variant="contained"

                size="small"

                startIcon={<AddRoundedIcon />}

                onClick={() => navigate(`/radiology/orders/new?consultationId=${consultation.id}`)}

              >

                Order Imaging Studies

              </Button>

            )}

          </Stack>



          {radiologyOrdersQuery.isLoading && (

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>

              <CircularProgress size={20} />

              <Typography variant="body2" color="text.secondary">

                Loading radiology orders…

              </Typography>

            </Stack>

          )}



          {radiologyOrdersQuery.isError && (

            <Alert severity="error" action={<Button onClick={() => void radiologyOrdersQuery.refetch()}>Retry</Button>}>

              Could not load radiology orders.

            </Alert>

          )}



          {!radiologyOrdersQuery.isLoading && !radiologyOrdersQuery.isError && radiologyOrders.length === 0 && (

            <Alert severity="info">No radiology orders yet for this consultation.</Alert>

          )}



          {radiologyOrders.length > 0 && (

            <List dense disablePadding>

              {radiologyOrders.map((radiologyOrder) => (

                <ListItem

                  key={radiologyOrder.id}

                  secondaryAction={

                    <Button

                      size="small"

                      startIcon={<VisibilityRoundedIcon />}

                      onClick={() => navigate(`/radiology/orders/${radiologyOrder.id}`)}

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

                          {radiologyOrder.orderNumber}

                        </Typography>

                        <Chip size="small" label={PRIORITY_LABELS[radiologyOrder.priority]} color={getPriorityChipColor(radiologyOrder.priority)} />

                        <Chip size="small" label={STATUS_LABELS[radiologyOrder.status]} color={getStatusChipColor(radiologyOrder.status)} />

                      </Stack>

                    }

                    secondary={`${radiologyOrder.items.length} test(s) • ${formatDisplayDate(radiologyOrder.createdAt.slice(0, 10))}`}

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



export default ConsultationRadiologyPanel;

