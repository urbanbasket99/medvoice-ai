export { default as DoctorListPage } from "./pages/DoctorListPage";
export { default as DoctorRegistrationPage } from "./pages/DoctorRegistrationPage";
export { default as DoctorDetailsPage } from "./pages/DoctorDetailsPage";
export { default as DoctorEditPage } from "./pages/DoctorEditPage";

export { default as DoctorTable } from "./components/DoctorTable";
export { default as DoctorSearchBar } from "./components/DoctorSearchBar";
export { default as DoctorForm } from "./components/DoctorForm";
export { default as DoctorFilters, EMPTY_DOCTOR_FILTERS } from "./components/DoctorFilters";
export { default as DoctorStatusChip } from "./components/DoctorStatusChip";
export { default as DoctorCard } from "./components/DoctorCard";
export { default as DoctorAvailabilityEditor } from "./components/DoctorAvailabilityEditor";
export { default as DoctorDeleteDialog } from "./components/DoctorDeleteDialog";
export { default as DoctorSnackbar } from "./components/DoctorSnackbar";
export { default as DoctorDetailsSkeleton } from "./components/DoctorDetailsSkeleton";

export { useDoctors, useDoctorSearch } from "./hooks/useDoctors";
export { useDoctor } from "./hooks/useDoctor";
export { useCreateDoctor } from "./hooks/useCreateDoctor";
export { useUpdateDoctor } from "./hooks/useUpdateDoctor";
export { useDeleteDoctor } from "./hooks/useDeleteDoctor";
export { useDoctorSnackbar } from "./hooks/useDoctorSnackbar";
export { useConsumeFlashMessage } from "./hooks/useConsumeFlashMessage";

export { doctorsApi } from "./api/doctorsApi";

export type {
  CreateDoctorPayload,
  Department,
  Doctor,
  DoctorAvailability,
  DoctorAvailabilitySlot,
  DoctorListParams,
  DoctorListResult,
  DoctorSearchParams,
  DoctorSortField,
  DoctorStatus,
  Gender,
  SortDirection,
  UpdateDoctorAvailabilityPayload,
  UpdateDoctorPayload,
} from "./types/doctor.types";
