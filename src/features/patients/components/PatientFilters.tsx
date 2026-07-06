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

import { BLOOD_GROUP_OPTIONS } from "../schemas/patientSchema";
import type { BloodGroup, Gender, PatientStatus } from "../types/patient.types";

export interface PatientFiltersValue {
  status: PatientStatus | "";
  gender: Gender | "";
  bloodGroup: BloodGroup | "";
  city: string;
}

export const EMPTY_PATIENT_FILTERS: PatientFiltersValue = {
  status: "",
  gender: "",
  bloodGroup: "",
  city: "",
};

export interface PatientFiltersProps {
  value: PatientFiltersValue;
  onChange: (value: PatientFiltersValue) => void;
}

const STATUS_OPTIONS: Array<{ value: PatientStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deceased", label: "Deceased" },
];

const GENDER_OPTIONS: Array<{ value: Gender | ""; label: string }> = [
  { value: "", label: "All genders" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const countActiveFilters = (value: PatientFiltersValue): number =>
  Object.values(value).filter((entry) => entry !== "").length;

/**
 * "Advanced Filters": a popover (rather than always-visible inline
 * controls) so the list toolbar stays compact while still surfacing
 * status/gender/blood-group/city filtering — all four map directly to
 * `GET /patients` query params (see `patientsApi.list`).
 */
const PatientFilters = ({ value, onChange }: PatientFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<PatientFiltersValue>(value);

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
    onChange(EMPTY_PATIENT_FILTERS);
    setDraft(EMPTY_PATIENT_FILTERS);
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
                setDraft((prev) => ({ ...prev, status: event.target.value as PatientStatus | "" }))
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
              select
              size="small"
              label="Blood Group"
              fullWidth
              value={draft.bloodGroup}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, bloodGroup: event.target.value as BloodGroup | "" }))
              }
            >
              <MenuItem value="">All blood groups</MenuItem>
              {BLOOD_GROUP_OPTIONS.filter((option) => option !== "unknown").map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="City"
              fullWidth
              value={draft.city}
              onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
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

export default PatientFilters;
