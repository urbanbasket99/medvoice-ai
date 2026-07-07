export { default as AppointmentListPage } from "./pages/AppointmentListPage";
export { default as AppointmentCreatePage } from "./pages/AppointmentCreatePage";
export { default as AppointmentDetailsPage } from "./pages/AppointmentDetailsPage";
export { default as AppointmentEditPage } from "./pages/AppointmentEditPage";

export { default as AppointmentTable } from "./components/AppointmentTable";
export { default as AppointmentSearchBar } from "./components/AppointmentSearchBar";
export { default as AppointmentForm } from "./components/AppointmentForm";
export { default as AppointmentFilters, EMPTY_APPOINTMENT_FILTERS } from "./components/AppointmentFilters";
export { default as AppointmentStatusChip } from "./components/AppointmentStatusChip";
export { default as AppointmentCard } from "./components/AppointmentCard";
export { default as AppointmentCalendar } from "./components/AppointmentCalendar";
export { default as AppointmentDeleteDialog } from "./components/AppointmentDeleteDialog";
export { default as AppointmentSnackbar } from "./components/AppointmentSnackbar";
export { default as AppointmentDetailsSkeleton } from "./components/AppointmentDetailsSkeleton";

export { useAppointments, useAppointmentSearch } from "./hooks/useAppointments";
export { useAppointment } from "./hooks/useAppointment";
export { useCreateAppointment } from "./hooks/useCreateAppointment";
export { useUpdateAppointment } from "./hooks/useUpdateAppointment";
export { useDeleteAppointment } from "./hooks/useDeleteAppointment";
export { useAppointmentSnackbar } from "./hooks/useAppointmentSnackbar";
export { useConsumeFlashMessage } from "./hooks/useConsumeFlashMessage";

export { appointmentsApi } from "./api/appointmentsApi";

export type {
  Appointment,
  AppointmentListParams,
  AppointmentListResult,
  AppointmentPriority,
  AppointmentSearchParams,
  AppointmentSortField,
  AppointmentStatus,
  AppointmentType,
  CalendarViewMode,
  CreateAppointmentPayload,
  Department,
  SortDirection,
  UpdateAppointmentPayload,
} from "./types/appointment.types";
