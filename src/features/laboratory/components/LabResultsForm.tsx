import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useUpdateLabResults } from "../hooks/useUpdateLabResults";
import type { LabOrder, LabResultFlag, LabResultItemPayload } from "../types/laboratory.types";

const RESULT_FLAG_OPTIONS: Array<LabResultFlag | ""> = ["", "normal", "low", "high", "critical", "abnormal"];

const RESULT_FLAG_LABELS: Record<LabResultFlag, string> = {
  normal: "Normal",
  low: "Low",
  high: "High",
  critical: "Critical",
  abnormal: "Abnormal",
};

const EDITABLE_STATUSES = new Set(["sample_collected", "in_progress", "completed"]);

interface LabResultsFormProps {
  labOrder: LabOrder;
  canUpdate: boolean;
  onSaved?: () => void;
}

const LabResultsForm = ({ labOrder, canUpdate, onSaved }: LabResultsFormProps) => {
  const updateResults = useUpdateLabResults();
  const [rows, setRows] = useState<LabResultItemPayload[]>([]);
  const [isPartialReport, setIsPartialReport] = useState(labOrder.isPartialReport);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsPartialReport(labOrder.isPartialReport);
    setRows(
      labOrder.items.map((item) => ({
        id: item.id,
        resultValue: item.resultValue ?? "",
        resultUnit: item.resultUnit ?? "",
        referenceRange: item.referenceRange ?? "",
        resultFlag: item.resultFlag,
        resultNotes: item.resultNotes ?? "",
        sampleBarcode: item.sampleBarcode ?? "",
      }))
    );
  }, [labOrder.items, labOrder.isPartialReport]);

  if (!EDITABLE_STATUSES.has(labOrder.status)) {
    return null;
  }

  const updateRow = (id: string, patch: Partial<LabResultItemPayload>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateResults.mutateAsync({
        id: labOrder.id,
        payload: {
          isPartialReport,
          items: rows.map((row) => ({
            id: row.id,
            resultValue: row.resultValue || null,
            resultUnit: row.resultUnit || null,
            referenceRange: row.referenceRange || null,
            resultFlag: row.resultFlag || null,
            resultNotes: row.resultNotes || null,
            sampleBarcode: row.sampleBarcode || null,
          })),
        },
      });
      onSaved?.();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Could not save lab results."));
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader title="Lab Results" subheader="Enter result values for each ordered test." />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControlLabel
            control={
              <Checkbox
                checked={isPartialReport}
                disabled={!canUpdate}
                onChange={(event) => setIsPartialReport(event.target.checked)}
              />
            }
            label="Partial report (not all tests resulted yet)"
          />
          {rows.map((row, index) => {
            const item = labOrder.items[index];
            return (
              <Box
                key={row.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  {item?.labTestName ?? `Test ${index + 1}`}
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      label="Result value"
                      size="small"
                      fullWidth
                      disabled={!canUpdate}
                      value={row.resultValue ?? ""}
                      onChange={(event) => updateRow(row.id, { resultValue: event.target.value })}
                    />
                    <TextField
                      label="Unit"
                      size="small"
                      fullWidth
                      disabled={!canUpdate}
                      value={row.resultUnit ?? ""}
                      onChange={(event) => updateRow(row.id, { resultUnit: event.target.value })}
                    />
                    <TextField
                      label="Reference range"
                      size="small"
                      fullWidth
                      disabled={!canUpdate}
                      value={row.referenceRange ?? ""}
                      onChange={(event) => updateRow(row.id, { referenceRange: event.target.value })}
                    />
                    <TextField
                      select
                      label="Flag"
                      size="small"
                      fullWidth
                      disabled={!canUpdate}
                      value={row.resultFlag ?? ""}
                      onChange={(event) =>
                        updateRow(row.id, {
                          resultFlag: (event.target.value || null) as LabResultFlag | null,
                        })
                      }
                    >
                      {RESULT_FLAG_OPTIONS.map((flag) => (
                        <MenuItem key={flag || "none"} value={flag}>
                          {flag ? RESULT_FLAG_LABELS[flag] : "—"}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                  <TextField
                    label="Sample barcode"
                    size="small"
                    fullWidth
                    disabled={!canUpdate}
                    value={row.sampleBarcode ?? ""}
                    onChange={(event) => updateRow(row.id, { sampleBarcode: event.target.value })}
                  />
                  <TextField
                    label="Result notes"
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={!canUpdate}
                    value={row.resultNotes ?? ""}
                    onChange={(event) => updateRow(row.id, { resultNotes: event.target.value })}
                  />
                </Stack>
              </Box>
            );
          })}
          {canUpdate && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={updateResults.isPending}
                startIcon={updateResults.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
                onClick={() => void handleSave()}
              >
                Save Results
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LabResultsForm;
