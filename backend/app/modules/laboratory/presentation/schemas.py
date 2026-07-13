from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.laboratory.application.dto.lab_order_dto import (
    CreateLabOrderInput,
    LabOrderItemInput,
    LabOrderPrintOutput,
    LabResultItemInput,
    LabResultsPrintOutput,
    UpdateLabOrderInput,
    UpdateLabOrderStatusInput,
    SendLabResultsEmailInput,
    UpdateLabResultsInput,
)
from app.modules.laboratory.domain.entities.lab_order import LabOrder, LabOrderItem, LabOrderStatusEvent
from app.modules.laboratory.domain.entities.lab_test_master import LabTestMaster
from app.modules.laboratory.domain.value_objects import (
    LabOrderPage,
    LabPriority,
    LabStatus,
    ResultFlag,
    SampleType,
)


class LabOrderItemRequest(BaseModel):
    lab_test_master_id: UUID | None = None
    lab_test_name: str = Field(min_length=1, max_length=200)
    category: str | None = Field(default=None, max_length=100)
    sample_type: SampleType
    instructions: str | None = Field(default=None, max_length=2000)
    sort_order: int = 0

    def to_input(self) -> LabOrderItemInput:
        return LabOrderItemInput(
            lab_test_master_id=self.lab_test_master_id,
            lab_test_name=self.lab_test_name,
            category=self.category,
            sample_type=self.sample_type,
            instructions=self.instructions,
            sort_order=self.sort_order,
        )


class LabOrderCreateRequest(BaseModel):
    consultation_id: UUID
    priority: LabPriority = LabPriority.ROUTINE
    clinical_notes: str | None = Field(default=None, max_length=4000)
    items: list[LabOrderItemRequest] = Field(min_length=1)

    def to_input(self) -> CreateLabOrderInput:
        return CreateLabOrderInput(
            consultation_id=self.consultation_id,
            priority=self.priority,
            clinical_notes=self.clinical_notes,
            items=tuple(item.to_input() for item in self.items),
        )


class LabOrderUpdateRequest(BaseModel):
    priority: LabPriority
    clinical_notes: str | None = Field(default=None, max_length=4000)
    items: list[LabOrderItemRequest] = Field(min_length=1)

    def to_input(self) -> UpdateLabOrderInput:
        return UpdateLabOrderInput(
            priority=self.priority,
            clinical_notes=self.clinical_notes,
            items=tuple(item.to_input() for item in self.items),
        )


class LabOrderStatusUpdateRequest(BaseModel):
    status: LabStatus
    notes: str | None = Field(default=None, max_length=2000)

    def to_input(self) -> UpdateLabOrderStatusInput:
        return UpdateLabOrderStatusInput(status=self.status.value, notes=self.notes)


class LabResultItemRequest(BaseModel):
    id: UUID
    result_value: str | None = Field(default=None, max_length=200)
    result_unit: str | None = Field(default=None, max_length=50)
    reference_range: str | None = Field(default=None, max_length=100)
    result_flag: ResultFlag | None = None
    result_notes: str | None = Field(default=None, max_length=4000)
    sample_barcode: str | None = Field(default=None, max_length=64)

    def to_input(self) -> LabResultItemInput:
        return LabResultItemInput(
            id=self.id,
            result_value=self.result_value,
            result_unit=self.result_unit,
            reference_range=self.reference_range,
            result_flag=self.result_flag,
            result_notes=self.result_notes,
            sample_barcode=self.sample_barcode,
        )


class LabResultsUpdateRequest(BaseModel):
    items: list[LabResultItemRequest] = Field(min_length=1)
    is_partial_report: bool = False

    def to_input(self) -> UpdateLabResultsInput:
        return UpdateLabResultsInput(
            items=tuple(item.to_input() for item in self.items),
            is_partial_report=self.is_partial_report,
        )


class LabResultsEmailRequest(BaseModel):
    recipient_email: str = Field(min_length=3, max_length=255)
    recipient_role: str | None = Field(default=None, max_length=30)

    def to_input(self) -> SendLabResultsEmailInput:
        return SendLabResultsEmailInput(
            recipient_email=self.recipient_email,
            recipient_role=self.recipient_role,
        )


class ReportEmailDeliveryResponse(BaseModel):
    id: UUID
    resource_type: str
    resource_id: UUID
    recipient_email: str
    recipient_role: str | None
    subject: str
    status: str
    sent_at: datetime | None
    created_at: datetime


class LabOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lab_order_id: UUID
    lab_test_master_id: UUID | None
    lab_test_name: str
    category: str | None
    sample_type: SampleType
    instructions: str | None
    sort_order: int
    result_value: str | None = None
    result_unit: str | None = None
    reference_range: str | None = None
    result_flag: ResultFlag | None = None
    result_notes: str | None = None
    resulted_at: datetime | None = None
    resulted_by: UUID | None = None
    sample_barcode: str | None = None

    @classmethod
    def from_entity(cls, item: LabOrderItem) -> "LabOrderItemResponse":
        return cls(
            id=item.id,
            lab_order_id=item.lab_order_id,
            lab_test_master_id=item.lab_test_master_id,
            lab_test_name=item.lab_test_name,
            category=item.category,
            sample_type=item.sample_type,
            instructions=item.instructions,
            sort_order=item.sort_order,
            result_value=item.result_value,
            result_unit=item.result_unit,
            reference_range=item.reference_range,
            result_flag=item.result_flag,
            result_notes=item.result_notes,
            resulted_at=item.resulted_at,
            resulted_by=item.resulted_by,
            sample_barcode=item.sample_barcode,
        )


class LabOrderStatusEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lab_order_id: UUID
    status: LabStatus
    notes: str | None
    changed_at: datetime

    @classmethod
    def from_entity(cls, event: LabOrderStatusEvent) -> "LabOrderStatusEventResponse":
        return cls(
            id=event.id,
            lab_order_id=event.lab_order_id,
            status=event.status,
            notes=event.notes,
            changed_at=event.changed_at,
        )


class LabOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    order_number: str
    priority: LabPriority
    clinical_notes: str | None
    status: LabStatus
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    doctor_specialization: str | None = None
    consultation_visit_number: str | None = None
    is_partial_report: bool = False
    items: list[LabOrderItemResponse] = Field(default_factory=list)
    status_history: list[LabOrderStatusEventResponse] = Field(default_factory=list)

    @classmethod
    def from_entity(cls, lab_order: LabOrder) -> "LabOrderResponse":
        return cls(
            id=lab_order.id,
            consultation_id=lab_order.consultation_id,
            patient_id=lab_order.patient_id,
            doctor_id=lab_order.doctor_id,
            order_number=lab_order.order_number,
            priority=lab_order.priority,
            clinical_notes=lab_order.clinical_notes,
            status=lab_order.status,
            created_at=lab_order.created_at,
            updated_at=lab_order.updated_at,
            patient_name=lab_order.patient_name,
            patient_mrn=lab_order.patient_mrn,
            patient_uhid=lab_order.patient_uhid,
            patient_gender=lab_order.patient_gender,
            patient_date_of_birth=lab_order.patient_date_of_birth,
            doctor_name=lab_order.doctor_name,
            doctor_code=lab_order.doctor_code,
            doctor_specialization=lab_order.doctor_specialization,
            consultation_visit_number=lab_order.consultation_visit_number,
            is_partial_report=lab_order.is_partial_report,
            items=[LabOrderItemResponse.from_entity(item) for item in lab_order.items or []],
            status_history=[
                LabOrderStatusEventResponse.from_entity(event)
                for event in lab_order.status_history or []
            ],
        )


class LabOrderListResponse(BaseModel):
    items: list[LabOrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: LabOrderPage) -> "LabOrderListResponse":
        return cls(
            items=[LabOrderResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class LabTestMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    test_code: str
    test_name: str
    department: str
    sample_type: SampleType
    normal_turnaround_time: str | None
    price: Decimal | None
    is_active: bool
    created_at: datetime

    @classmethod
    def from_entity(cls, test: LabTestMaster) -> "LabTestMasterResponse":
        return cls(
            id=test.id,
            test_code=test.test_code,
            test_name=test.test_name,
            department=test.department,
            sample_type=test.sample_type,
            normal_turnaround_time=test.normal_turnaround_time,
            price=test.price,
            is_active=test.is_active,
            created_at=test.created_at,
        )


class LabTestSearchResponse(BaseModel):
    items: list[LabTestMasterResponse]

    @classmethod
    def from_entities(cls, tests: list[LabTestMaster]) -> "LabTestSearchResponse":
        return cls(items=[LabTestMasterResponse.from_entity(test) for test in tests])


class LabTestListResponse(BaseModel):
    items: list[LabTestMasterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, tests: list[LabTestMaster], total: int, page: int, page_size: int) -> "LabTestListResponse":
        total_pages = max(1, (total + page_size - 1) // page_size) if page_size > 0 else 1
        return cls(
            items=[LabTestMasterResponse.from_entity(test) for test in tests],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )


class LabOrderPrintItemResponse(BaseModel):
    lab_test_name: str
    category: str | None
    sample_type: str
    instructions: str | None
    result_value: str | None = None
    result_unit: str | None = None
    reference_range: str | None = None
    result_flag: str | None = None
    result_notes: str | None = None


class LabOrderPrintResponse(BaseModel):
    lab_order_id: UUID
    order_number: str
    consultation_id: UUID
    priority: str
    status: str
    clinical_notes: str | None
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    items: list[LabOrderPrintItemResponse]
    created_at: datetime

    @classmethod
    def from_output(cls, output: LabOrderPrintOutput) -> "LabOrderPrintResponse":
        return cls(
            lab_order_id=output.lab_order_id,
            order_number=output.order_number,
            consultation_id=output.consultation_id,
            priority=output.priority,
            status=output.status,
            clinical_notes=output.clinical_notes,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            patient_uhid=output.patient_uhid,
            patient_gender=output.patient_gender,
            patient_date_of_birth=output.patient_date_of_birth,
            doctor_name=output.doctor_name,
            doctor_code=output.doctor_code,
            doctor_specialization=output.doctor_specialization,
            consultation_visit_number=output.consultation_visit_number,
            items=[
                LabOrderPrintItemResponse(
                    lab_test_name=item.lab_test_name,
                    category=item.category,
                    sample_type=item.sample_type,
                    instructions=item.instructions,
                    result_value=item.result_value,
                    result_unit=item.result_unit,
                    reference_range=item.reference_range,
                    result_flag=item.result_flag,
                    result_notes=item.result_notes,
                )
                for item in output.items
            ],
            created_at=output.created_at,
        )


class LabResultsPrintItemResponse(BaseModel):
    lab_test_name: str
    category: str | None
    sample_type: str
    result_value: str | None
    result_unit: str | None
    reference_range: str | None
    result_flag: str | None
    result_notes: str | None
    resulted_at: datetime | None


class LabResultsPrintResponse(BaseModel):
    lab_order_id: UUID
    order_number: str
    consultation_id: UUID
    status: str
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    items: list[LabResultsPrintItemResponse]
    created_at: datetime

    @classmethod
    def from_output(cls, output: LabResultsPrintOutput) -> "LabResultsPrintResponse":
        return cls(
            lab_order_id=output.lab_order_id,
            order_number=output.order_number,
            consultation_id=output.consultation_id,
            status=output.status,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            patient_uhid=output.patient_uhid,
            patient_gender=output.patient_gender,
            patient_date_of_birth=output.patient_date_of_birth,
            doctor_name=output.doctor_name,
            doctor_code=output.doctor_code,
            doctor_specialization=output.doctor_specialization,
            consultation_visit_number=output.consultation_visit_number,
            items=[
                LabResultsPrintItemResponse(
                    lab_test_name=item.lab_test_name,
                    category=item.category,
                    sample_type=item.sample_type,
                    result_value=item.result_value,
                    result_unit=item.result_unit,
                    reference_range=item.reference_range,
                    result_flag=item.result_flag,
                    result_notes=item.result_notes,
                    resulted_at=item.resulted_at,
                )
                for item in output.items
            ],
            created_at=output.created_at,
        )
