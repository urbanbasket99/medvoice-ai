import { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import { useNavigate } from "react-router-dom";

import { APPOINTMENT_STATUS_LABELS, STATUS_COLORS } from "../schemas/appointmentSchema";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  formatDisplayDate,
  formatDisplayTime,
  parseDateKey,
  startOfMonth,
  startOfWeek,
  todayKey,
} from "../utils/dateUtils";
import type { Appointment, AppointmentStatus, CalendarViewMode } from "../types/appointment.types";

export interface AppointmentCalendarProps {
  appointments: Appointment[];
  loading?: boolean;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  anchorDate: Date;
  onAnchorDateChange: (date: Date) => void;
  scheduleDoctorId?: string;
  onScheduleDoctorIdChange?: (doctorId: string) => void;
  doctorOptions?: Array<{ id: string; label: string }>;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusChipColor = (status: AppointmentStatus) => STATUS_COLORS[status];

const AppointmentEventChip = ({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick: () => void;
}) => (
  <Chip
    size="small"
    clickable
    onClick={onClick}
    label={`${formatDisplayTime(appointment.appointmentTime)} ${appointment.patientName ?? appointment.appointmentNumber}`}
    color={statusChipColor(appointment.status)}
    variant="outlined"
    sx={{ width: "100%", justifyContent: "flex-start", mb: 0.5 }}
  />
);

const AppointmentCalendar = ({
  appointments,
  loading = false,
  viewMode,
  onViewModeChange,
  anchorDate,
  onAnchorDateChange,
  scheduleDoctorId = "",
  onScheduleDoctorIdChange,
  doctorOptions = [],
}: AppointmentCalendarProps) => {
  const navigate = useNavigate();

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const key = appointment.appointmentDate;
      const existing = map.get(key) ?? [];
      existing.push(appointment);
      map.set(key, existing.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime)));
    }
    return map;
  }, [appointments]);

  const title = useMemo(() => {
    if (viewMode === "month") {
      return anchorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }
    if (viewMode === "week" || viewMode === "doctor") {
      const start = startOfWeek(anchorDate);
      const end = endOfWeek(anchorDate);
      return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return formatDisplayDate(formatDateKey(anchorDate));
  }, [anchorDate, viewMode]);

  const monthGridDays = useMemo(() => {
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    const gridStart = startOfWeek(start);
    const days: Date[] = [];
    let cursor = gridStart;
    while (cursor <= end || days.length % 7 !== 0) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
      if (days.length > 42) break;
    }
    return days;
  }, [anchorDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [anchorDate]);

  const filteredAppointments = useMemo(() => {
    if (viewMode !== "doctor" || !scheduleDoctorId) return appointments;
    return appointments.filter((appointment) => appointment.doctorId === scheduleDoctorId);
  }, [appointments, scheduleDoctorId, viewMode]);

  const navigatePeriod = (direction: -1 | 1) => {
    if (viewMode === "month") {
      onAnchorDateChange(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + direction, 1));
      return;
    }
    if (viewMode === "week" || viewMode === "doctor") {
      onAnchorDateChange(addDays(anchorDate, direction * 7));
      return;
    }
    onAnchorDateChange(addDays(anchorDate, direction));
  };

  const renderAgendaList = (items: Appointment[]) => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No appointments in this range.
        </Typography>
      );
    }

    const grouped = new Map<string, Appointment[]>();
    for (const appointment of items) {
      const bucket = grouped.get(appointment.appointmentDate) ?? [];
      bucket.push(appointment);
      grouped.set(appointment.appointmentDate, bucket);
    }

    return (
      <Stack spacing={2}>
        {[...grouped.entries()].map(([dateKey, dayAppointments]) => (
          <Box key={dateKey}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {formatDisplayDate(dateKey)}
            </Typography>
            <Stack spacing={1}>
              {dayAppointments.map((appointment) => (
                <Card key={appointment.id} variant="outlined">
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 72 }}>
                        {formatDisplayTime(appointment.appointmentTime)}
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {appointment.patientName} with {appointment.doctorName}
                      </Typography>
                      <Chip size="small" label={APPOINTMENT_STATUS_LABELS[appointment.status]} color={statusChipColor(appointment.status)} />
                      <Chip size="small" label={appointment.appointmentNumber} variant="outlined" onClick={() => navigate(`/appointments/${appointment.id}`)} clickable />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  };

  const renderMonthView = () => (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
      {WEEKDAY_LABELS.map((label) => (
        <Typography key={label} variant="caption" color="text.secondary" sx={{ fontWeight: 700, textAlign: "center" }}>
          {label}
        </Typography>
      ))}
      {monthGridDays.map((day) => {
        const key = formatDateKey(day);
        const dayAppointments = appointmentsByDate.get(key) ?? [];
        const inMonth = day.getMonth() === anchorDate.getMonth();
        const isToday = key === todayKey();
        return (
          <Card
            key={key}
            variant="outlined"
            sx={{
              minHeight: 110,
              bgcolor: isToday ? "action.hover" : inMonth ? "background.paper" : "action.disabledBackground",
              opacity: inMonth ? 1 : 0.65,
            }}
          >
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="caption" sx={{ fontWeight: isToday ? 700 : 500 }}>
                {day.getDate()}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <AppointmentEventChip
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  />
                ))}
                {dayAppointments.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayAppointments.length - 3} more
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );

  const renderWeekView = () => (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(7, 1fr)" }, gap: 1 }}>
      {weekDays.map((day) => {
        const key = formatDateKey(day);
        const dayAppointments = appointmentsByDate.get(key) ?? [];
        return (
          <Card key={key} variant="outlined" sx={{ minHeight: 180 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                {WEEKDAY_LABELS[day.getDay()]} {day.getDate()}
              </Typography>
              {dayAppointments.map((appointment) => (
                <AppointmentEventChip
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );

  const renderDayView = () => {
    const key = formatDateKey(anchorDate);
    const dayAppointments = appointmentsByDate.get(key) ?? [];
    const hours = Array.from({ length: 12 }, (_, index) => index + 8);

    return (
      <Stack spacing={1}>
        {hours.map((hour) => {
          const hourAppointments = dayAppointments.filter((appointment) => Number(appointment.appointmentTime.slice(0, 2)) === hour);
          return (
            <Stack key={hour} direction="row" spacing={2}>
              <Typography variant="caption" color="text.secondary" sx={{ width: 56, pt: 1 }}>
                {`${hour.toString().padStart(2, "0")}:00`}
              </Typography>
              <Box sx={{ flex: 1, minHeight: 48, borderLeft: 1, borderColor: "divider", pl: 2 }}>
                {hourAppointments.map((appointment) => (
                  <AppointmentEventChip
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  />
                ))}
              </Box>
            </Stack>
          );
        })}
      </Stack>
    );
  };

  const renderDoctorSchedule = () => (
    <Stack spacing={2}>
      {onScheduleDoctorIdChange && (
        <TextField
          select
          size="small"
          label="Doctor"
          value={scheduleDoctorId}
          onChange={(event) => onScheduleDoctorIdChange(event.target.value)}
          sx={{ maxWidth: 360 }}
        >
          <MenuItem value="">All doctors</MenuItem>
          {doctorOptions.map((doctor) => (
            <MenuItem key={doctor.id} value={doctor.id}>
              {doctor.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {renderWeekViewWithAppointments(filteredAppointments)}
    </Stack>
  );

  const renderWeekViewWithAppointments = (items: Appointment[]) => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of items) {
      const bucket = map.get(appointment.appointmentDate) ?? [];
      bucket.push(appointment);
      map.set(appointment.appointmentDate, bucket);
    }

    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(7, 1fr)" }, gap: 1 }}>
        {weekDays.map((day) => {
          const key = formatDateKey(day);
          const dayAppointments = map.get(key) ?? [];
          return (
            <Card key={key} variant="outlined" sx={{ minHeight: 180 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {WEEKDAY_LABELS[day.getDay()]} {day.getDate()}
                </Typography>
                {dayAppointments.map((appointment) => (
                  <AppointmentEventChip
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  const agendaItems = useMemo(() => {
    if (viewMode === "agenda") {
      return [...appointments].sort((a, b) =>
        `${a.appointmentDate}${a.appointmentTime}`.localeCompare(`${b.appointmentDate}${b.appointmentTime}`)
      );
    }
    return appointments;
  }, [appointments, viewMode]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <IconButton aria-label="Previous period" onClick={() => navigatePeriod(-1)}>
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton aria-label="Today" onClick={() => onAnchorDateChange(parseDateKey(todayKey()))}>
            <TodayRoundedIcon />
          </IconButton>
          <IconButton aria-label="Next period" onClick={() => navigatePeriod(1)}>
            <ChevronRightRoundedIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>

        <Tabs value={viewMode} onChange={(_, value: CalendarViewMode) => onViewModeChange(value)} variant="scrollable" scrollButtons="auto">
          <Tab value="month" label="Month" />
          <Tab value="week" label="Week" />
          <Tab value="day" label="Day" />
          <Tab value="agenda" label="Agenda" />
          <Tab value="doctor" label="Doctor Schedule" />
        </Tabs>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {(Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((status) => (
          <Chip key={status} size="small" label={APPOINTMENT_STATUS_LABELS[status]} color={statusChipColor(status)} variant="outlined" />
        ))}
      </Stack>

      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
      {viewMode === "agenda" && renderAgendaList(agendaItems)}
      {viewMode === "doctor" && renderDoctorSchedule()}
    </Stack>
  );
};

export default AppointmentCalendar;
