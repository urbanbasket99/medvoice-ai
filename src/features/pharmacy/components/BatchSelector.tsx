import { MenuItem, TextField } from "@mui/material";
import { useMemo } from "react";

import { useBatches } from "../hooks/useBatches";
import { formatDisplayDate, isExpiringSoon } from "../utils/pharmacyUtils";

export interface BatchSelectorProps {
  medicineId: string | null;
  value: string | null;
  onChange: (batchId: string | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const BatchSelector = ({
  medicineId,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: BatchSelectorProps) => {
  const batchesQuery = useBatches({ medicineId: medicineId ?? undefined });
  const batches = useMemo(
    () =>
      (batchesQuery.data ?? [])
        .filter((batch) => batch.quantity > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
    [batchesQuery.data]
  );

  return (
    <TextField
      select
      label="Batch"
      size="small"
      fullWidth
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
      disabled={disabled || !medicineId || batchesQuery.isLoading}
      error={error}
      helperText={helperText ?? (!medicineId ? "Select a medicine first" : undefined)}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {batches.map((batch) => (
        <MenuItem key={batch.id} value={batch.id}>
          {batch.batchNumber} — Exp {formatDisplayDate(batch.expiryDate)} — Qty {batch.quantity}
          {isExpiringSoon(batch.expiryDate) ? " ⚠" : ""}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default BatchSelector;
