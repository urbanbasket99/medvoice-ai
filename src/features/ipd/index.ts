export { default as WardListPage } from "./pages/WardListPage";
export { default as BedBoardPage } from "./pages/BedBoardPage";
export { default as AdmissionListPage } from "./pages/AdmissionListPage";
export { default as AdmissionCreatePage } from "./pages/AdmissionCreatePage";
export { default as AdmissionDetailsPage } from "./pages/AdmissionDetailsPage";

export { ipdApi } from "./api/ipdApi";

export type {
  Admission,
  AdmissionListParams,
  AdmissionStatus,
  AdmissionType,
  Bed,
  BedListParams,
  BedStatus,
  CreateAdmissionPayload,
  CreateBedPayload,
  CreateWardPayload,
  DischargeAdmissionPayload,
  PagedResult,
  UpdateAdmissionPayload,
  UpdateBedPayload,
  UpdateWardPayload,
  Ward,
  WardListParams,
  WardType,
} from "./types/ipd.types";
