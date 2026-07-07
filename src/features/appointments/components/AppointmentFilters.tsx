import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Autocomplete,
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
import { useQuery } from "@tanstack/react-query";

import { doctorsApi } from "../../doctors/api/doctorsApi";
import { patientsApi } from "../../patients/api/patientsApi";
import {
  APPOINTMENT_PRIORITY_LABELS,
  APPOINTMENT_PRIORITY_OPTIONS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_OPTIONS,
  DEPARTMENT_LABELS,
  DEPARTMENT_OPTIONS,
} from "../schemas/appointmentSchema";
import type {
  AppointmentPriority,
  AppointmentStatus,
  AppointmentType,
  Department,
} from "../types/appointment.types";

interface EntityOption {
  id: string;
  label: string;
}

export interface AppointmentFiltersValue {
  status: AppointmentStatus | "";
  priority: AppointmentPriority | "";
  appointmentType: AppointmentType | "";
  department: Department | "";
  patientId: string;
  doctorId: string;
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_APPOINTMENT_FILTERS: AppointmentFiltersValue = {
  status: "",
  priority: "",
  appointmentType: "",
  department: "",
  patientId: "",
  doctorId: "",
  dateFrom: "",
  dateTo: "",
};

export interface AppointmentFiltersProps {
  value: AppointmentFiltersValue;
  onChange: (value: AppointmentFiltersValue) => void;
}

const countActiveFilters = (value: AppointmentFiltersValue): number =>
  Object.entries(value).filter(([key, entry]) => {
    if (key === "dateFrom" || key === "dateTo") return entry !== "";
    return entry !== "";
  }).length;

const AppointmentFilters = ({ value, onChange }: AppointmentFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<AppointmentFiltersValue>(value);
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");

  const patientsQuery = useQuery({
    queryKey: ["patients", "filter-search", patientQuery],
    queryFn: () => patientsApi.search({ query: patientQuery, page: 1, pageSize: 10 }),
    enabled: patientQuery.trim().length > 1,
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors", "filter-search", doctorQuery],
    queryFn: () => doctorsApi.search({ query: doctorQuery, page: 1, pageSize: 10 }),
    enabled: doctorQuery.trim().length > 1,
  });

  const patientOptions: EntityOption[] =
    patientsQuery.data?.items.map((patient) => ({
      id: patient.id,
      label: `${patient.fullName} (${patient.uhid ?? patient.mrn ?? "—"})`,
    })) ?? [];

  const doctorOptions: EntityOption[] =
    doctorsQuery.data?.items.map((doctor) => ({
      id: doctor.id,
      label: `${doctor.fullName} (${doctor.doctorCode})`,
    })) ?? [];

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
    onChange(EMPTY_APPOINTMENT_FILTERS);
    setDraft(EMPTY_APPOINTMENT_FILTERS);
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
        <Box sx={{ p: 2.5, width: 320 }}>
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
              onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as AppointmentStatus | "" }))}
            >
              <MenuItem value="">All statuses</MenuItem>
              {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {APPOINTMENT_STATUS_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Priority"
              fullWidth
              value={draft.priority}
              onChange={(event) => setDraft((prev) => ({ ...prev, priority: event.target.value as AppointmentPriority | "" }))}
            >
              <MenuItem value="">All priorities</MenuItem>
              {APPOINTMENT_PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {APPOINTMENT_PRIORITY_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Type"
              fullWidth
              value={draft.appointmentType}
              onChange={(event) => setDraft((prev) => ({ ...prev, appointmentType: event.target.value as AppointmentType | "" }))}
            >
              <MenuItem value="">All types</MenuItem>
              {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {APPOINTMENT_TYPE_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Department"
              fullWidth
              value={draft.department}
              onChange={(event) => setDraft((prev) => ({ ...prev, department: event.target.value as Department | "" }))}
            >
              <MenuItem value="">All departments</MenuItem>
              {DEPARTMENT_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {DEPARTMENT_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              size="small"
              options={patientOptions}
              getOptionLabel={(option) => option.label}
              value={patientOptions.find((option) => option.id === draft.patientId) ?? null}
              onInputChange={(_, inputValue) => setPatientQuery(inputValue)}
              onChange={(_, option) => setDraft((prev) => ({ ...prev, patientId: option?.id ?? "" }))}
              renderInput={(params) => <TextField {...params} label="Patient" placeholder="Search patient" />}
              isOptionEqualToValue={(option, selected) => option.id === selected.id}
            />

            <Autocomplete
              size="small"
              options={doctorOptions}
              getOptionLabel={(option) => option.label}
              value={doctorOptions.find((option) => option.id === draft.doctorId) ?? null}
              onInputChange={(_, inputValue) => setDoctorQuery(inputValue)}
              onChange={(_, option) => setDraft((prev) => ({ ...prev, doctorId: option?.id ?? "" }))}
              renderInput={(params) => <TextField {...params} label="Doctor" placeholder="Search doctor" />}
              isOptionEqualToValue={(option, selected) => option.id === selected.id}
            />

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

export default AppointmentFilters;
