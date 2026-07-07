export { default as ConsultationListPage } from "./pages/ConsultationListPage";
export { default as ConsultationCreatePage } from "./pages/ConsultationCreatePage";
export { default as ConsultationDetailsPage } from "./pages/ConsultationDetailsPage";
export { default as ConsultationEditorPage } from "./pages/ConsultationEditorPage";

export { default as ConsultationWorkspace } from "./components/ConsultationWorkspace";
export { default as ConsultationTable } from "./components/ConsultationTable";
export { default as ConsultationSearchBar } from "./components/ConsultationSearchBar";
export { default as ConsultationFilters, EMPTY_CONSULTATION_FILTERS } from "./components/ConsultationFilters";
export { default as ConsultationStatusChip } from "./components/ConsultationStatusChip";
export { default as ConsultationPatientSummary } from "./components/ConsultationPatientSummary";
export { default as ConsultationClinicalForm } from "./components/ConsultationClinicalForm";
export { default as ConsultationStickySaveBar } from "./components/ConsultationStickySaveBar";
export { default as ConsultationDeleteDialog } from "./components/ConsultationDeleteDialog";
export { default as ConsultationSnackbar } from "./components/ConsultationSnackbar";
export { default as ConsultationDetailsSkeleton } from "./components/ConsultationDetailsSkeleton";

export { useConsultations, useConsultationSearch } from "./hooks/useConsultations";
export { useConsultation } from "./hooks/useConsultation";
export { useCreateConsultation } from "./hooks/useCreateConsultation";
export { useUpdateConsultation } from "./hooks/useUpdateConsultation";
export { useDeleteConsultation } from "./hooks/useDeleteConsultation";
export { useConsultationSnackbar } from "./hooks/useConsultationSnackbar";
export { useConsumeFlashMessage } from "./hooks/useConsumeFlashMessage";

export { consultationsApi } from "./api/consultationsApi";

export type {
  Consultation,
  ConsultationListParams,
  ConsultationListResult,
  ConsultationSearchParams,
  ConsultationSortField,
  ConsultationStatus,
  CreateConsultationPayload,
  SortDirection,
  UpdateConsultationPayload,
  VitalSigns,
} from "./types/consultation.types";
