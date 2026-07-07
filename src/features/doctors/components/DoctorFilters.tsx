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

import { DEPARTMENT_LABELS, DEPARTMENT_OPTIONS } from "../schemas/doctorSchema";
import type { Department, DoctorStatus, Gender } from "../types/doctor.types";

export interface DoctorFiltersValue {
  status: DoctorStatus | "";
  department: Department | "";
  gender: Gender | "";
  specialization: string;
}

export const EMPTY_DOCTOR_FILTERS: DoctorFiltersValue = {
  status: "",
  department: "",
  gender: "",
  specialization: "",
};

export interface DoctorFiltersProps {
  value: DoctorFiltersValue;
  onChange: (value: DoctorFiltersValue) => void;
}

const STATUS_OPTIONS: Array<{ value: DoctorStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
];

const GENDER_OPTIONS: Array<{ value: Gender | ""; label: string }> = [
  { value: "", label: "All genders" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const countActiveFilters = (value: DoctorFiltersValue): number =>
  Object.values(value).filter((entry) => entry !== "").length;

const DoctorFilters = ({ value, onChange }: DoctorFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<DoctorFiltersValue>(value);

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
    onChange(EMPTY_DOCTOR_FILTERS);
    setDraft(EMPTY_DOCTOR_FILTERS);
    handleClose();
  };

  return (
    <>
      <Badge color="primary" badgeContent={activeCount} invisible={activeCount === 0}>
        <Button
          variant="outlined"
          size="medium"
          startIcon={<TuneRoundedIcon fontSize="small" />}
          onClick={handleOpen}
        >
          Filters
        </Button>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
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
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, status: event.target.value as DoctorStatus | "" }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value || "all"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Department"
              fullWidth
              value={draft.department}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, department: event.target.value as Department | "" }))
              }
            >
              <MenuItem value="">All departments</MenuItem>
              {DEPARTMENT_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {DEPARTMENT_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Gender"
              fullWidth
              value={draft.gender}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, gender: event.target.value as Gender | "" }))
              }
            >
              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value || "all"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Specialization"
              fullWidth
              value={draft.specialization}
              onChange={(event) => setDraft((prev) => ({ ...prev, specialization: event.target.value }))}
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

export default DoctorFilters;
