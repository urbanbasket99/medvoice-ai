import asyncio
from uuid import UUID

from app.modules.search.domain.providers.search_index_provider import SearchIndexProvider
from app.modules.search.domain.repositories.search_repository import SearchRepository
from app.modules.search.domain.value_objects import (
    GlobalSearchCriteria,
    GlobalSearchPage,
    SearchCategory,
    SearchResultDTO,
)
from app.modules.search.infrastructure.models.recent_search_model import RecentSearchStore


class SqlAlchemySearchRepository(SearchRepository):
    """Aggregates module SearchIndexProviders without duplicating search SQL."""

    def __init__(
        self,
        providers: list[SearchIndexProvider],
        recent_store: RecentSearchStore,
    ) -> None:
        self._providers = {provider.category: provider for provider in providers}
        self._recent_store = recent_store

    def _resolve_categories(
        self, criteria: GlobalSearchCriteria, allowed: set[SearchCategory]
    ) -> list[SearchCategory]:
        requested = criteria.categories or list(SearchCategory)
        return [category for category in requested if category in allowed]

    async def search(self, criteria: GlobalSearchCriteria, allowed: set[SearchCategory]) -> GlobalSearchPage:
        query = criteria.query.strip()
        if not query:
            return GlobalSearchPage(query=query, groups={}, total=0)

        categories = self._resolve_categories(criteria, allowed)
        tasks = [
            self._providers[category].search(query, criteria.limit_per_category)
            for category in categories
            if category in self._providers
        ]
        results = await asyncio.gather(*tasks) if tasks else []

        groups: dict[SearchCategory, list[SearchResultDTO]] = {}
        total = 0
        for category, items in zip(categories, results, strict=True):
            if items:
                groups[category] = items
                total += len(items)

        return GlobalSearchPage(query=query, groups=groups, total=total)

    async def suggest(
        self, query: str, allowed: set[SearchCategory], limit: int = 8
    ) -> list[SearchResultDTO]:
        criteria = GlobalSearchCriteria(query=query, limit_per_category=max(2, limit // max(len(allowed), 1)))
        page = await self.search(criteria, allowed)
        suggestions: list[SearchResultDTO] = []
        for items in page.groups.values():
            suggestions.extend(items)
            if len(suggestions) >= limit:
                break
        return suggestions[:limit]

    async def list_recent(self, user_id: UUID, limit: int = 10) -> list[str]:
        return await self._recent_store.list_recent(user_id, limit)

    async def save_recent(self, user_id: UUID, query: str) -> None:
        await self._recent_store.save_recent(user_id, query)
