import { Alert, Button, Card, CardContent, CardHeader, Chip, Divider, Stack, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useNavigate } from "react-router-dom";

import { useDispensesByPrescription } from "../hooks/useDispenses";
import { formatDisplayDate, getStatusChipColor, STATUS_LABELS } from "../utils/pharmacyUtils";

export interface PrescriptionDispensePanelProps {
  prescriptionId: string;
}

const PrescriptionDispensePanel = ({ prescriptionId }: PrescriptionDispensePanelProps) => {
  const navigate = useNavigate();
  const dispensesQuery = useDispensesByPrescription(prescriptionId);
  const dispenses = dispensesQuery.data ?? [];

  if (dispensesQuery.isLoading) {
    return null;
  }

  if (dispenses.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined">
      <CardHeader title="Pharmacy Dispenses" />
      <Divider />
      <CardContent>
        <Stack spacing={1.5}>
          {dispensesQuery.isError && (
            <Alert severity="warning">Could not load dispense records for this prescription.</Alert>
          )}
          {dispenses.map((dispense) => (
            <Stack
              key={dispense.id}
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <Stack spacing={0.25}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {dispense.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDisplayDate(dispense.createdAt)} • {dispense.items.length} item(s)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip
                  size="small"
                  label={STATUS_LABELS[dispense.status]}
                  color={getStatusChipColor(dispense.status)}
                />
                <Button
                  size="small"
                  endIcon={<OpenInNewRoundedIcon />}
                  onClick={() => navigate(`/pharmacy/dispense/${dispense.id}`)}
                >
                  View
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PrescriptionDispensePanel;
