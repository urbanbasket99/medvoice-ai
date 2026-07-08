from abc import ABC, abstractmethod

from app.modules.search.domain.value_objects import SearchCategory, SearchResultDTO


class SearchIndexProvider(ABC):
    category: SearchCategory
    permission_code: str

    @abstractmethod
    async def search(self, query: str, limit: int) -> list[SearchResultDTO]:
        raise NotImplementedError
