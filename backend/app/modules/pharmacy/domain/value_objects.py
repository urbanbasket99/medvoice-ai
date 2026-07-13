from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.pharmacy.domain.entities.dispense_record import DispenseRecord
    from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
    from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock


class MedicineCategory(StrEnum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    SYRUP = "syrup"
    INJECTION = "injection"
    CREAM = "cream"
    OINTMENT = "ointment"
    DROPS = "drops"
    INHALER = "inhaler"
    OTHER = "other"


class DispenseStatus(StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DISPENSED = "dispensed"
    CANCELLED = "cancelled"


class DispenseType(StrEnum):
    PRESCRIPTION = "prescription"
    RETAIL = "retail"


class VendorPaymentMethod(StrEnum):
    CASH = "cash"
    CHEQUE = "cheque"
    BANK_TRANSFER = "bank_transfer"
    UPI = "upi"
    CARD = "card"
    OTHER = "other"


class StockReturnKind(StrEnum):
    PURCHASE = "purchase"
    SALES = "sales"


class StockMovementType(StrEnum):
    PURCHASE = "purchase"
    DISPENSE = "dispense"
    ADJUSTMENT = "adjustment"
    RETURN = "return"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class MedicineSortField(StrEnum):
    CREATED_AT = "created_at"
    GENERIC_NAME = "generic_name"
    BRAND_NAME = "brand_name"
    MEDICINE_CODE = "medicine_code"


class DispenseSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    ORDER_NUMBER = "order_number"


@dataclass(frozen=True, slots=True)
class MedicineListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: MedicineSortField = MedicineSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    category: MedicineCategory | None = None
    is_active: bool | None = None


@dataclass(frozen=True, slots=True)
class MedicinePage:
    items: list[PharmacyMedicine]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))


@dataclass(frozen=True, slots=True)
class DispenseListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: DispenseSortField = DispenseSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    prescription_id: UUID | None = None
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    status: DispenseStatus | None = None
    dispense_type: DispenseType | None = None


@dataclass(frozen=True, slots=True)
class DispensePage:
    items: list[DispenseRecord]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))


@dataclass(frozen=True, slots=True)
class InventoryListCriteria:
    page: int = 1
    page_size: int = 20
    sort_dir: SortDirection = SortDirection.ASC


@dataclass(frozen=True, slots=True)
class InventoryPage:
    items: list[PharmacyMedicineStock]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))


@dataclass(frozen=True, slots=True)
class StockMovementListCriteria:
    page: int = 1
    page_size: int = 20
    medicine_id: UUID | None = None
    movement_type: StockMovementType | None = None


@dataclass(frozen=True, slots=True)
class StockMovementPage:
    items: list
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
