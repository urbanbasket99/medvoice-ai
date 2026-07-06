export { default as PatientListPage } from "./pages/PatientListPage";
export { default as PatientRegistrationPage } from "./pages/PatientRegistrationPage";
export { default as PatientDetailsPage } from "./pages/PatientDetailsPage";
export { default as PatientEditPage } from "./pages/PatientEditPage";

export { default as PatientTable } from "./components/PatientTable";
export { default as PatientSearchBar } from "./components/PatientSearchBar";
export { default as PatientForm } from "./components/PatientForm";
export { default as PatientFilters, EMPTY_PATIENT_FILTERS } from "./components/PatientFilters";
export { default as PatientStatusChip } from "./components/PatientStatusChip";
export { default as PatientDeleteDialog } from "./components/PatientDeleteDialog";
export { default as PatientSnackbar } from "./components/PatientSnackbar";
export { default as PatientDetailsSkeleton } from "./components/PatientDetailsSkeleton";

export { usePatients, usePatientSearch } from "./hooks/usePatients";
export { usePatient } from "./hooks/usePatient";
export { useCreatePatient } from "./hooks/useCreatePatient";
export { useUpdatePatient } from "./hooks/useUpdatePatient";
export { useDeletePatient } from "./hooks/useDeletePatient";
export { usePatientSnackbar } from "./hooks/usePatientSnackbar";
export { useConsumeFlashMessage } from "./hooks/useConsumeFlashMessage";

export { patientsApi } from "./api/patientsApi";

export type {
  BloodGroup,
  CreatePatientPayload,
  Gender,
  MaritalStatus,
  Patient,
  PatientListParams,
  PatientListResult,
  PatientSearchParams,
  PatientSortField,
  PatientStatus,
  SortDirection,
  UpdatePatientPayload,
} from "./types/patient.types";
