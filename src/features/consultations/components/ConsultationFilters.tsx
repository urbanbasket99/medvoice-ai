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

import { CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_OPTIONS } from "../schemas/consultationSchema";
import type { ConsultationStatus } from "../types/consultation.types";

export interface ConsultationFiltersValue {
  status: ConsultationStatus | "";
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_CONSULTATION_FILTERS: ConsultationFiltersValue = {
  status: "",
  dateFrom: "",
  dateTo: "",
};

export interface ConsultationFiltersProps {
  value: ConsultationFiltersValue;
  onChange: (value: ConsultationFiltersValue) => void;
}

const countActiveFilters = (value: ConsultationFiltersValue): number =>
  Object.values(value).filter((entry) => entry !== "").length;

const ConsultationFilters = ({ value, onChange }: ConsultationFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<ConsultationFiltersValue>(value);
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
    onChange(EMPTY_CONSULTATION_FILTERS);
    setDraft(EMPTY_CONSULTATION_FILTERS);
    handleClose();
  };

  return (
    <>
      <Badge color="primary" badgeContent={activeCount} invisible={activeCount === 0}>
        <Button variant="outlined" size="medium" startIcon={<TuneRoundedIcon fontSize="small" />} onClick={handleOpen}>
          Filters
        </Button>
      </Badge>

      <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Box sx={{ p: 2.5, width: 300 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Advanced Filters
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              size="small"
              label="Status"
              fullWidth
              value={draft.status}
              onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as ConsultationStatus | "" }))}
            >
              <MenuItem value="">All statuses</MenuItem>
              {CONSULTATION_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {CONSULTATION_STATUS_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Date from"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.dateFrom}
              onChange={(event) => setDraft((prev) => ({ ...prev, dateFrom: event.target.value }))}
            />
            <TextField
              size="small"
              label="Date to"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.dateTo}
              onChange={(event) => setDraft((prev) => ({ ...prev, dateTo: event.target.value }))}
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between" }}>
            <Button size="small" onClick={handleClearAll}>
              Clear all
            </Button>
            <Button size="small" variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default ConsultationFilters;
