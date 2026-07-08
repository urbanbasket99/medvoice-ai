from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.search.domain.value_objects import (
    GlobalSearchCriteria,
    GlobalSearchPage,
    SearchCategory,
    SearchResultDTO,
)


class SearchRepository(ABC):
    @abstractmethod
    async def search(self, criteria: GlobalSearchCriteria, allowed: set[SearchCategory]) -> GlobalSearchPage:
        raise NotImplementedError

    @abstractmethod
    async def suggest(
        self, query: str, allowed: set[SearchCategory], limit: int = 8
    ) -> list[SearchResultDTO]:
        raise NotImplementedError

    @abstractmethod
    async def list_recent(self, user_id: UUID, limit: int = 10) -> list[str]:
        raise NotImplementedError

    @abstractmethod
    async def save_recent(self, user_id: UUID, query: str) -> None:
        raise NotImplementedError
