export type RadiologyPriority = "routine" | "urgent" | "stat";
export type RadiologyStatus = "ordered" | "scheduled" | "in_progress" | "completed" | "cancelled";
export type ImagingCategory =
  | "xray"
  | "ct"
  | "mri"
  | "ultrasound"
  | "mammography"
  | "fluoroscopy"
  | "nuclear"
  | "other";
export type RadiologyOrderSortField = "created_at" | "updated_at" | "order_number";
export type SortDirection = "asc" | "desc";

export interface RadiologyOrderItem {
  id: string;
  radiologyOrderId: string;
  radiologyTestMasterId: string | null;
  testName: string;
  category: ImagingCategory;
  bodyPart: string;
  contrastRequired: boolean;
  instructions: string | null;
  sortOrder: number;
}

export interface RadiologyOrderStatusEvent {
  id: string;
  radiologyOrderId: string;
  status: RadiologyStatus;
  notes: string | null;
  changedAt: string;
}

export interface RadiologyOrder {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  orderNumber: string;
  priority: RadiologyPriority;
  clinicalNotes: string | null;
  status: RadiologyStatus;
  createdAt: string;
  updatedAt: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  consultationVisitNumber: string | null;
  items: RadiologyOrderItem[];
  statusHistory: RadiologyOrderStatusEvent[];
}

export interface RadiologyOrderListResult {
  items: RadiologyOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RadiologyOrderListParams {
  page?: number;
  pageSize?: number;
  sortBy?: RadiologyOrderSortField;
  sortDir?: SortDirection;
  consultationId?: string;
  patientId?: string;
  doctorId?: string;
  status?: RadiologyStatus;
}

export interface RadiologyOrderSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface RadiologyOrderItemPayload {
  radiologyTestMasterId?: string | null;
  testName: string;
  category: ImagingCategory;
  bodyPart: string;
  contrastRequired: boolean;
  instructions?: string | null;
  sortOrder: number;
}

export interface CreateRadiologyOrderPayload {
  consultationId: string;
  priority: RadiologyPriority;
  clinicalNotes?: string | null;
  items: RadiologyOrderItemPayload[];
}

export interface UpdateRadiologyOrderPayload {
  priority: RadiologyPriority;
  clinicalNotes?: string | null;
  items: RadiologyOrderItemPayload[];
}

export interface UpdateRadiologyOrderStatusPayload {
  status: RadiologyStatus;
  notes?: string | null;
}

export interface RadiologyTestMaster {
  id: string;
  testCode: string;
  testName: string;
  category: ImagingCategory;
  bodyPart: string;
  estimatedDuration: string | null;
  price: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RadiologyTestSearchResult {
  items: RadiologyTestMaster[];
}

export interface RadiologyTestListParams {
  page?: number;
  pageSize?: number;
}

export interface RadiologyTestListResult {
  items: RadiologyTestMaster[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RadiologyOrderPrintItem {
  testName: string;
  category: string;
  bodyPart: string;
  contrastRequired: boolean;
  instructions: string | null;
}

export interface RadiologyOrderPrintData {
  radiologyOrderId: string;
  orderNumber: string;
  consultationId: string;
  priority: string;
  status: string;
  clinicalNotes: string | null;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  consultationVisitNumber: string | null;
  items: RadiologyOrderPrintItem[];
  createdAt: string;
}
