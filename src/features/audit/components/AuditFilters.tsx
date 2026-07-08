import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import type { AuditAction, AuditFiltersValue } from "../types/audit.types";
import { AUDIT_ACTION_LABELS, formatModuleLabel } from "../utils/auditUtils";

export const EMPTY_AUDIT_FILTERS: AuditFiltersValue = {
  module: "",
  action: "",
  userName: "",
  dateFrom: "",
  dateTo: "",
};

export interface AuditFiltersProps {
  value: AuditFiltersValue;
  onChange: (value: AuditFiltersValue) => void;
  moduleOptions: string[];
  actionOptions: AuditAction[];
}

const countActiveFilters = (value: AuditFiltersValue): number =>
  Object.values(value).filter((entry) => entry !== "").length;

const AuditFilters = ({ value, onChange, moduleOptions, actionOptions }: AuditFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<AuditFiltersValue>(value);

  const activeCount = countActiveFilters(value);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setDraft(value);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleApply = () => {
    onChange(draft);
    handleClose();
  };

  const handleClearAll = () => {
    onChange(EMPTY_AUDIT_FILTERS);
    handleClose();
  };

  return (
    <>
      <Badge badgeContent={activeCount} color="primary" invisible={activeCount === 0}>
        <Button variant="outlined" size="small" startIcon={<TuneRoundedIcon />} onClick={handleOpen}>
          Filters
        </Button>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 360, p: 2 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Audit Filters
        </Typography>

        <Stack spacing={2}>
          <TextField
            select
            size="small"
            label="Module"
            value={draft.module}
            onChange={(e) => setDraft((prev) => ({ ...prev, module: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All modules</MenuItem>
            {moduleOptions.map((module) => (
              <MenuItem key={module} value={module}>
                {formatModuleLabel(module)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Action"
            value={draft.action}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, action: e.target.value as AuditAction | "" }))
            }
            fullWidth
          >
            <MenuItem value="">All actions</MenuItem>
            {actionOptions.map((action) => (
              <MenuItem key={action} value={action}>
                {AUDIT_ACTION_LABELS[action]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label="User name"
            value={draft.userName}
            onChange={(e) => setDraft((prev) => ({ ...prev, userName: e.target.value }))}
            fullWidth
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <TextField
              size="small"
              label="From"
              type="date"
              value={draft.dateFrom}
              onChange={(e) => setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              value={draft.dateTo}
              onChange={(e) => setDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button size="small" onClick={handleClearAll}>
            Clear
          </Button>
          <Button size="small" variant="contained" onClick={handleApply}>
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default AuditFilters;
