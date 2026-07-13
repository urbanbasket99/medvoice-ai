export type LabPriority = "routine" | "urgent" | "stat";
export type LabStatus = "ordered" | "sample_collected" | "in_progress" | "completed" | "cancelled";
export type SampleType = "blood" | "urine" | "stool" | "swab" | "sputum" | "csf" | "tissue" | "other";
export type LabResultFlag = "normal" | "low" | "high" | "critical" | "abnormal";
export type LabOrderSortField = "created_at" | "updated_at" | "order_number";
export type SortDirection = "asc" | "desc";

export interface LabOrderItem {
  id: string;
  labOrderId: string;
  labTestMasterId: string | null;
  labTestName: string;
  category: string | null;
  sampleType: SampleType;
  instructions: string | null;
  sortOrder: number;
  resultValue: string | null;
  resultUnit: string | null;
  referenceRange: string | null;
  resultFlag: LabResultFlag | null;
  resultNotes: string | null;
  resultedAt: string | null;
  resultedBy: string | null;
  sampleBarcode: string | null;
}

export interface LabOrderStatusEvent {
  id: string;
  labOrderId: string;
  status: LabStatus;
  notes: string | null;
  changedAt: string;
}

export interface LabOrder {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  orderNumber: string;
  priority: LabPriority;
  clinicalNotes: string | null;
  status: LabStatus;
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
  isPartialReport: boolean;
  items: LabOrderItem[];
  statusHistory: LabOrderStatusEvent[];
}

export interface LabOrderListResult {
  items: LabOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LabOrderListParams {
  page?: number;
  pageSize?: number;
  sortBy?: LabOrderSortField;
  sortDir?: SortDirection;
  consultationId?: string;
  patientId?: string;
  doctorId?: string;
  status?: LabStatus;
}

export interface LabOrderSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface LabOrderItemPayload {
  labTestMasterId?: string | null;
  labTestName: string;
  category?: string | null;
  sampleType: SampleType;
  instructions?: string | null;
  sortOrder: number;
}

export interface CreateLabOrderPayload {
  consultationId: string;
  priority: LabPriority;
  clinicalNotes?: string | null;
  items: LabOrderItemPayload[];
}

export interface UpdateLabOrderPayload {
  priority: LabPriority;
  clinicalNotes?: string | null;
  items: LabOrderItemPayload[];
}

export interface UpdateLabOrderStatusPayload {
  status: LabStatus;
  notes?: string | null;
}

export interface LabResultItemPayload {
  id: string;
  resultValue?: string | null;
  resultUnit?: string | null;
  referenceRange?: string | null;
  resultFlag?: LabResultFlag | null;
  resultNotes?: string | null;
  sampleBarcode?: string | null;
}

export interface UpdateLabResultsPayload {
  items: LabResultItemPayload[];
  isPartialReport?: boolean;
}

export interface SendLabResultsEmailPayload {
  recipientEmail: string;
  recipientRole?: string | null;
}

export interface ReportEmailDelivery {
  id: string;
  resourceType: string;
  resourceId: string;
  recipientEmail: string;
  recipientRole: string | null;
  subject: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export interface LabTestMaster {
  id: string;
  testCode: string;
  testName: string;
  department: string;
  sampleType: SampleType;
  normalTurnaroundTime: string | null;
  price: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface LabTestSearchResult {
  items: LabTestMaster[];
}

export interface LabTestListParams {
  page?: number;
  pageSize?: number;
}

export interface LabTestListResult {
  items: LabTestMaster[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LabOrderPrintItem {
  labTestName: string;
  category: string | null;
  sampleType: string;
  instructions: string | null;
  resultValue?: string | null;
  resultUnit?: string | null;
  referenceRange?: string | null;
  resultFlag?: string | null;
  resultNotes?: string | null;
}

export interface LabOrderPrintData {
  labOrderId: string;
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
  items: LabOrderPrintItem[];
  createdAt: string;
}

export type LabResultsPrintData = LabOrderPrintData;
