import { useMemo, useState } from "react";
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../auth";
import { doctorsApi } from "../../doctors/api/doctorsApi";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentDeleteDialog from "../components/AppointmentDeleteDialog";
import AppointmentFilters, { EMPTY_APPOINTMENT_FILTERS } from "../components/AppointmentFilters";
import type { AppointmentFiltersValue } from "../components/AppointmentFilters";
import AppointmentSearchBar from "../components/AppointmentSearchBar";
import AppointmentSnackbar from "../components/AppointmentSnackbar";
import AppointmentTable from "../components/AppointmentTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteAppointment } from "../hooks/useDeleteAppointment";
import { useAppointmentSearch, useAppointments } from "../hooks/useAppointments";
import { useAppointmentSnackbar } from "../hooks/useAppointmentSnackbar";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  startOfMonth,
  startOfWeek,
  todayKey,
} from "../utils/dateUtils";
import type { Appointment, AppointmentSortField, CalendarViewMode } from "../types/appointment.types";

const SORT_FIELD_MAP: Record<string, AppointmentSortField> = {
  appointmentNumber: "created_at",
  tokenNumber: "token_number",
  appointmentDate: "appointment_date",
  appointmentTime: "appointment_time",
  status: "status",
  priority: "priority",
  createdAt: "created_at",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "appointmentDate", sort: "desc" }];

const resolveCalendarRange = (viewMode: CalendarViewMode, anchorDate: Date) => {
  if (viewMode === "month") {
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    return { dateFrom: formatDateKey(startOfWeek(start)), dateTo: formatDateKey(endOfWeek(end)) };
  }
  if (viewMode === "week" || viewMode === "doctor") {
    return { dateFrom: formatDateKey(startOfWeek(anchorDate)), dateTo: formatDateKey(endOfWeek(anchorDate)) };
  }
  if (viewMode === "day") {
    const key = formatDateKey(anchorDate);
    return { dateFrom: key, dateTo: key };
  }
  const start = addDays(new Date(), -7);
  const end = addDays(new Date(), 30);
  return { dateFrom: formatDateKey(start), dateTo: formatDateKey(end) };
};

const AppointmentListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:delete"));

  const [viewLayout, setViewLayout] = useState<"table" | "calendar">("table");
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [scheduleDoctorId, setScheduleDoctorId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<AppointmentFiltersValue>(EMPTY_APPOINTMENT_FILTERS);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = useAppointmentSnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "appointment_date";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const calendarRange = useMemo(
    () => resolveCalendarRange(calendarViewMode, anchorDate),
    [anchorDate, calendarViewMode]
  );

  const listQuery = useAppointments({
    page: viewLayout === "calendar" ? 1 : paginationModel.page + 1,
    pageSize: viewLayout === "calendar" ? 500 : paginationModel.pageSize,
    sortBy,
    sortDir,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    appointmentType: filters.appointmentType || undefined,
    department: filters.department || undefined,
    patientId: filters.patientId || undefined,
    doctorId: filters.doctorId || scheduleDoctorId || undefined,
    dateFrom: filters.dateFrom || (viewLayout === "calendar" ? calendarRange.dateFrom : undefined),
    dateTo: filters.dateTo || (viewLayout === "calendar" ? calendarRange.dateTo : undefined),
  });

  const searchResult = useAppointmentSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const doctorsForSchedule = useQuery({
    queryKey: ["doctors", "schedule-options"],
    queryFn: () => doctorsApi.list({ page: 1, pageSize: 100, status: "active" }),
    enabled: viewLayout === "calendar" && calendarViewMode === "doctor",
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const deleteAppointment = useDeleteAppointment();

  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmCancel = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAppointment.mutateAsync(pendingDelete.id);
      showSuccess(`Appointment ${pendingDelete.appointmentNumber} was cancelled.`);
      setPendingDelete(null);
    } catch {
      showError(`Could not cancel appointment ${pendingDelete.appointmentNumber}. Please try again.`);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule, search, and manage patient appointments.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewLayout}
            onChange={(_, value: "table" | "calendar" | null) => value && setViewLayout(value)}
          >
            <ToggleButton value="table" aria-label="Table view">
              <TableRowsRoundedIcon fontSize="small" sx={{ mr: 0.5 }} /> Table
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="Calendar view">
              <CalendarMonthRoundedIcon fontSize="small" sx={{ mr: 0.5 }} /> Calendar
            </ToggleButton>
          </ToggleButtonGroup>
          {canCreate && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/appointments/new")}>
              New Appointment
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}>
        <Box sx={{ flex: 1, maxWidth: { md: 420 } }}>
          <AppointmentSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              resetToFirstPage();
            }}
          />
        </Box>
        <AppointmentFilters
          value={filters}
          onChange={(value) => {
            setFilters(value);
            resetToFirstPage();
          }}
        />
      </Stack>

      {viewLayout === "table" ? (
        <AppointmentTable
          rows={rows}
          rowCount={rowCount}
          loading={activeQuery.isFetching}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          onView={(appointment) => navigate(`/appointments/${appointment.id}`)}
          onEdit={(appointment) => navigate(`/appointments/${appointment.id}/edit`)}
          onCancel={setPendingDelete}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ) : (
        <AppointmentCalendar
          appointments={rows}
          loading={activeQuery.isFetching}
          viewMode={calendarViewMode}
          onViewModeChange={setCalendarViewMode}
          anchorDate={anchorDate}
          onAnchorDateChange={setAnchorDate}
          scheduleDoctorId={scheduleDoctorId}
          onScheduleDoctorIdChange={setScheduleDoctorId}
          doctorOptions={
            doctorsForSchedule.data?.items.map((doctor) => ({
              id: doctor.id,
              label: `${doctor.fullName} (${doctor.doctorCode})`,
            })) ?? []
          }
        />
      )}

      <AppointmentDeleteDialog
        appointment={pendingDelete}
        isDeleting={deleteAppointment.isPending}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setPendingDelete(null)}
      />
      <AppointmentSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default AppointmentListPage;
