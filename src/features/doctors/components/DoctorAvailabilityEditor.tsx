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
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { doctorsApi } from "../api/doctorsApi";
import { doctorAvailabilityQueryOptions, doctorsQueryKeys } from "../api/doctorsQueries";
import type { DoctorAvailabilitySlot } from "../types/doctor.types";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptySlot = (): DoctorAvailabilitySlot => ({
  dayOfWeek: 0,
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 30,
  isActive: true,
});

interface DoctorAvailabilityEditorProps {
  doctorId: string;
  canUpdate: boolean;
}

const DoctorAvailabilityEditor = ({ doctorId, canUpdate }: DoctorAvailabilityEditorProps) => {
  const queryClient = useQueryClient();
  const availabilityQuery = useQuery(doctorAvailabilityQueryOptions(doctorId));
  const [slots, setSlots] = useState<DoctorAvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (availabilityQuery.data) {
      setSlots(availabilityQuery.data.slots);
    }
  }, [availabilityQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      doctorsApi.updateAvailability(doctorId, {
        slots: slots.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotMinutes: slot.slotMinutes,
          isActive: slot.isActive,
        })),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(doctorsQueryKeys.availability(doctorId), data);
      setSuccess("Availability saved.");
      setError(null);
    },
  });

  const updateSlot = (index: number, patch: Partial<DoctorAvailabilitySlot>) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const handleSave = async () => {
    setSuccess(null);
    setError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Could not save availability."));
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Availability"
        subheader="Weekly schedule used for appointment slot generation."
        action={
          canUpdate ? (
            <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setSlots((prev) => [...prev, emptySlot()])}>
              Add slot
            </Button>
          ) : undefined
        }
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {availabilityQuery.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void availabilityQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load availability.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {availabilityQuery.isLoading ? (
            <Stack sx={{ alignItems: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : slots.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No availability slots configured.
            </Typography>
          ) : (
            slots.map((slot, index) => (
              <Box
                key={`${slot.dayOfWeek}-${slot.startTime}-${index}`}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" } }}>
                  <TextField
                    select
                    label="Day"
                    size="small"
                    value={slot.dayOfWeek}
                    disabled={!canUpdate}
                    onChange={(event) => updateSlot(index, { dayOfWeek: Number(event.target.value) })}
                    sx={{ minWidth: 140 }}
                  >
                    {DAY_LABELS.map((label, day) => (
                      <MenuItem key={label} value={day}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Start"
                    type="time"
                    size="small"
                    value={slot.startTime}
                    disabled={!canUpdate}
                    onChange={(event) => updateSlot(index, { startTime: event.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="End"
                    type="time"
                    size="small"
                    value={slot.endTime}
                    disabled={!canUpdate}
                    onChange={(event) => updateSlot(index, { endTime: event.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="Slot (min)"
                    type="number"
                    size="small"
                    value={slot.slotMinutes}
                    disabled={!canUpdate}
                    onChange={(event) => updateSlot(index, { slotMinutes: Number(event.target.value) || 30 })}
                    sx={{ width: 110 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={slot.isActive}
                        disabled={!canUpdate}
                        onChange={(event) => updateSlot(index, { isActive: event.target.checked })}
                      />
                    }
                    label="Active"
                  />
                  {canUpdate && (
                    <IconButton
                      color="error"
                      onClick={() => setSlots((prev) => prev.filter((_, i) => i !== index))}
                      aria-label="Remove slot"
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  )}
                </Stack>
              </Box>
            ))
          )}

          {canUpdate && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={saveMutation.isPending}
                startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
                onClick={() => void handleSave()}
              >
                Save Availability
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DoctorAvailabilityEditor;
