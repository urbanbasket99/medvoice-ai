from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.radiology.application.dto.radiology_order_dto import (
    CreateRadiologyOrderInput,
    RadiologyOrderItemInput,
    RadiologyOrderPrintOutput,
    UpdateRadiologyOrderInput,
    UpdateRadiologyOrderStatusInput,
)
from app.modules.radiology.domain.entities.radiology_order import (
    RadiologyOrder,
    RadiologyOrderItem,
    RadiologyOrderStatusEvent,
)
from app.modules.radiology.domain.entities.radiology_test_master import RadiologyTestMaster
from app.modules.radiology.domain.value_objects import (
    ImagingCategory,
    RadiologyOrderPage,
    RadiologyPriority,
    RadiologyStatus,
)


class RadiologyOrderItemRequest(BaseModel):
    radiology_test_master_id: UUID | None = None
    test_name: str = Field(min_length=1, max_length=200)
    category: ImagingCategory
    body_part: str = Field(min_length=1, max_length=100)
    contrast_required: bool = False
    instructions: str | None = Field(default=None, max_length=2000)
    sort_order: int = 0

    def to_input(self) -> RadiologyOrderItemInput:
        return RadiologyOrderItemInput(
            radiology_test_master_id=self.radiology_test_master_id,
            test_name=self.test_name,
            category=self.category,
            body_part=self.body_part,
            contrast_required=self.contrast_required,
            instructions=self.instructions,
            sort_order=self.sort_order,
        )


class RadiologyOrderCreateRequest(BaseModel):
    consultation_id: UUID
    priority: RadiologyPriority = RadiologyPriority.ROUTINE
    clinical_notes: str | None = Field(default=None, max_length=4000)
    items: list[RadiologyOrderItemRequest] = Field(min_length=1)

    def to_input(self) -> CreateRadiologyOrderInput:
        return CreateRadiologyOrderInput(
            consultation_id=self.consultation_id,
            priority=self.priority,
            clinical_notes=self.clinical_notes,
            items=tuple(item.to_input() for item in self.items),
        )


class RadiologyOrderUpdateRequest(BaseModel):
    priority: RadiologyPriority
    clinical_notes: str | None = Field(default=None, max_length=4000)
    items: list[RadiologyOrderItemRequest] = Field(min_length=1)

    def to_input(self) -> UpdateRadiologyOrderInput:
        return UpdateRadiologyOrderInput(
            priority=self.priority,
            clinical_notes=self.clinical_notes,
            items=tuple(item.to_input() for item in self.items),
        )


class RadiologyOrderStatusUpdateRequest(BaseModel):
    status: RadiologyStatus
    notes: str | None = Field(default=None, max_length=2000)

    def to_input(self) -> UpdateRadiologyOrderStatusInput:
        return UpdateRadiologyOrderStatusInput(status=self.status.value, notes=self.notes)


class RadiologyOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    radiology_order_id: UUID
    radiology_test_master_id: UUID | None
    test_name: str
    category: ImagingCategory
    body_part: str
    contrast_required: bool
    instructions: str | None
    sort_order: int

    @classmethod
    def from_entity(cls, item: RadiologyOrderItem) -> "RadiologyOrderItemResponse":
        return cls(
            id=item.id,
            radiology_order_id=item.radiology_order_id,
            radiology_test_master_id=item.radiology_test_master_id,
            test_name=item.test_name,
            category=item.category,
            body_part=item.body_part,
            contrast_required=item.contrast_required,
            instructions=item.instructions,
            sort_order=item.sort_order,
        )


class RadiologyOrderStatusEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    radiology_order_id: UUID
    status: RadiologyStatus
    notes: str | None
    changed_at: datetime

    @classmethod
    def from_entity(cls, event: RadiologyOrderStatusEvent) -> "RadiologyOrderStatusEventResponse":
        return cls(
            id=event.id,
            radiology_order_id=event.radiology_order_id,
            status=event.status,
            notes=event.notes,
            changed_at=event.changed_at,
        )


class RadiologyOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    order_number: str
    priority: RadiologyPriority
    clinical_notes: str | None
    status: RadiologyStatus
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
    items: list[RadiologyOrderItemResponse] = Field(default_factory=list)
    status_history: list[RadiologyOrderStatusEventResponse] = Field(default_factory=list)

    @classmethod
    def from_entity(cls, radiology_order: RadiologyOrder) -> "RadiologyOrderResponse":
        return cls(
            id=radiology_order.id,
            consultation_id=radiology_order.consultation_id,
            patient_id=radiology_order.patient_id,
            doctor_id=radiology_order.doctor_id,
            order_number=radiology_order.order_number,
            priority=radiology_order.priority,
            clinical_notes=radiology_order.clinical_notes,
            status=radiology_order.status,
            created_at=radiology_order.created_at,
            updated_at=radiology_order.updated_at,
            patient_name=radiology_order.patient_name,
            patient_mrn=radiology_order.patient_mrn,
            patient_uhid=radiology_order.patient_uhid,
            patient_gender=radiology_order.patient_gender,
            patient_date_of_birth=radiology_order.patient_date_of_birth,
            doctor_name=radiology_order.doctor_name,
            doctor_code=radiology_order.doctor_code,
            doctor_specialization=radiology_order.doctor_specialization,
            consultation_visit_number=radiology_order.consultation_visit_number,
            items=[RadiologyOrderItemResponse.from_entity(item) for item in radiology_order.items or []],
            status_history=[
                RadiologyOrderStatusEventResponse.from_entity(event)
                for event in radiology_order.status_history or []
            ],
        )


class RadiologyOrderListResponse(BaseModel):
    items: list[RadiologyOrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: RadiologyOrderPage) -> "RadiologyOrderListResponse":
        return cls(
            items=[RadiologyOrderResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class RadiologyTestMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    test_code: str
    test_name: str
    category: ImagingCategory
    body_part: str
    estimated_duration: str | None
    price: Decimal | None
    is_active: bool
    created_at: datetime

    @classmethod
    def from_entity(cls, test: RadiologyTestMaster) -> "RadiologyTestMasterResponse":
        return cls(
            id=test.id,
            test_code=test.test_code,
            test_name=test.test_name,
            category=test.category,
            body_part=test.body_part,
            estimated_duration=test.estimated_duration,
            price=test.price,
            is_active=test.is_active,
            created_at=test.created_at,
        )


class RadiologyTestSearchResponse(BaseModel):
    items: list[RadiologyTestMasterResponse]

    @classmethod
    def from_entities(cls, tests: list[RadiologyTestMaster]) -> "RadiologyTestSearchResponse":
        return cls(items=[RadiologyTestMasterResponse.from_entity(test) for test in tests])


class RadiologyTestListResponse(BaseModel):
    items: list[RadiologyTestMasterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(
        cls, tests: list[RadiologyTestMaster], total: int, page: int, page_size: int
    ) -> "RadiologyTestListResponse":
        total_pages = max(1, (total + page_size - 1) // page_size) if page_size > 0 else 1
        return cls(
            items=[RadiologyTestMasterResponse.from_entity(test) for test in tests],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )


class RadiologyOrderPrintItemResponse(BaseModel):
    test_name: str
    category: str
    body_part: str
    contrast_required: bool
    instructions: str | None


class RadiologyOrderPrintResponse(BaseModel):
    radiology_order_id: UUID
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
    items: list[RadiologyOrderPrintItemResponse]
    created_at: datetime

    @classmethod
    def from_output(cls, output: RadiologyOrderPrintOutput) -> "RadiologyOrderPrintResponse":
        return cls(
            radiology_order_id=output.radiology_order_id,
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
                RadiologyOrderPrintItemResponse(
                    test_name=item.test_name,
                    category=item.category,
                    body_part=item.body_part,
                    contrast_required=item.contrast_required,
                    instructions=item.instructions,
                )
                for item in output.items
            ],
            created_at=output.created_at,
        )
