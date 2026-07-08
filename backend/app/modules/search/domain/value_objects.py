from dataclasses import dataclass
from enum import Enum


class SearchCategory(str, Enum):
    PATIENTS = "patients"
    DOCTORS = "doctors"
    APPOINTMENTS = "appointments"
    CONSULTATIONS = "consultations"
    PRESCRIPTIONS = "prescriptions"
    LABORATORY_ORDERS = "laboratory_orders"
    RADIOLOGY_ORDERS = "radiology_orders"
    MEDICINES = "medicines"
    INVOICES = "invoices"
    AUDIT_LOGS = "audit_logs"


CATEGORY_PERMISSIONS: dict[SearchCategory, str] = {
    SearchCategory.PATIENTS: "patients:read",
    SearchCategory.DOCTORS: "doctors:read",
    SearchCategory.APPOINTMENTS: "appointments:read",
    SearchCategory.CONSULTATIONS: "consultations:read",
    SearchCategory.PRESCRIPTIONS: "prescriptions:read",
    SearchCategory.LABORATORY_ORDERS: "laboratory:read",
    SearchCategory.RADIOLOGY_ORDERS: "radiology:read",
    SearchCategory.MEDICINES: "pharmacy:read",
    SearchCategory.INVOICES: "billing:read",
    SearchCategory.AUDIT_LOGS: "audit:read",
}


@dataclass(slots=True)
class GlobalSearchCriteria:
    query: str
    categories: list[SearchCategory] | None = None
    limit_per_category: int = 5


@dataclass(slots=True)
class GlobalSearchPage:
    query: str
    groups: dict[SearchCategory, list["SearchResultDTO"]]
    total: int


@dataclass(slots=True)
class SearchResultDTO:
    id: str
    category: SearchCategory
    title: str
    subtitle: str
    description: str
    route: str
    highlight: str | None = None
