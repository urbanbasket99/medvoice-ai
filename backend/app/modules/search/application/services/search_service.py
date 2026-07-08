from uuid import UUID

from app.domain.entities.user import User
from app.modules.search.domain.repositories.search_repository import SearchRepository
from app.modules.search.domain.value_objects import (
    CATEGORY_PERMISSIONS,
    GlobalSearchCriteria,
    GlobalSearchPage,
    SearchCategory,
    SearchResultDTO,
)


class SearchService:
    """Permission-aware global search orchestrator."""

    def __init__(self, repository: SearchRepository) -> None:
        self._repository = repository

    def allowed_categories(
        self,
        user: User,
        categories: list[SearchCategory] | None = None,
    ) -> set[SearchCategory]:
        requested = categories or list(SearchCategory)
        allowed: set[SearchCategory] = set()
        for category in requested:
            if user.has_permission(CATEGORY_PERMISSIONS[category]):
                allowed.add(category)
        return allowed

    async def search(
        self,
        user: User,
        query: str,
        categories: list[SearchCategory] | None = None,
        limit_per_category: int = 5,
    ) -> GlobalSearchPage:
        normalized = query.strip()
        allowed = self.allowed_categories(user, categories)
        filtered_categories = None
        if categories:
            filtered_categories = [category for category in categories if category in allowed]

        criteria = GlobalSearchCriteria(
            query=normalized,
            categories=filtered_categories,
            limit_per_category=limit_per_category,
        )
        result = await self._repository.search(criteria, allowed)
        if normalized:
            await self._repository.save_recent(user.id, normalized)
        return result

    async def suggest(
        self,
        user: User,
        query: str,
        categories: list[SearchCategory] | None = None,
        limit: int = 8,
    ) -> list[SearchResultDTO]:
        allowed = self.allowed_categories(user, categories)
        return await self._repository.suggest(query.strip(), allowed, limit)

    async def recent(self, user: User, limit: int = 10) -> list[str]:
        return await self._repository.list_recent(user.id, limit)
