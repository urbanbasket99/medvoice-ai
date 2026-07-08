from pydantic import BaseModel, ConfigDict

from app.modules.search.domain.value_objects import (
    GlobalSearchPage,
    SearchCategory,
    SearchResultDTO,
)


class SearchResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: SearchCategory
    title: str
    subtitle: str
    description: str
    route: str
    highlight: str | None = None

    @classmethod
    def from_dto(cls, dto: SearchResultDTO) -> "SearchResultResponse":
        return cls(
            id=dto.id,
            category=dto.category,
            title=dto.title,
            subtitle=dto.subtitle,
            description=dto.description,
            route=dto.route,
            highlight=dto.highlight,
        )


class SearchGroupResponse(BaseModel):
    category: SearchCategory
    label: str
    items: list[SearchResultResponse]


class GlobalSearchResponse(BaseModel):
    query: str
    total: int
    groups: list[SearchGroupResponse]

    @classmethod
    def from_page(cls, page: GlobalSearchPage) -> "GlobalSearchResponse":
        labels = {
            SearchCategory.PATIENTS: "Patients",
            SearchCategory.DOCTORS: "Doctors",
            SearchCategory.APPOINTMENTS: "Appointments",
            SearchCategory.CONSULTATIONS: "Consultations",
            SearchCategory.PRESCRIPTIONS: "Prescriptions",
            SearchCategory.LABORATORY_ORDERS: "Laboratory Orders",
            SearchCategory.RADIOLOGY_ORDERS: "Radiology Orders",
            SearchCategory.MEDICINES: "Medicines",
            SearchCategory.INVOICES: "Invoices",
            SearchCategory.AUDIT_LOGS: "Audit Logs",
        }
        groups = [
            SearchGroupResponse(
                category=category,
                label=labels.get(category, category.value),
                items=[SearchResultResponse.from_dto(item) for item in items],
            )
            for category, items in page.groups.items()
        ]
        return cls(query=page.query, total=page.total, groups=groups)


class SearchSuggestionResponse(BaseModel):
    query: str
    items: list[SearchResultResponse]


class RecentSearchResponse(BaseModel):
    items: list[str]
