from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser
from app.modules.search.application.services.search_service import SearchService
from app.modules.search.domain.value_objects import SearchCategory
from app.modules.search.presentation.dependencies import SearchServiceDep
from app.modules.search.presentation.schemas import (
    GlobalSearchResponse,
    RecentSearchResponse,
    SearchSuggestionResponse,
)

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=GlobalSearchResponse)
async def global_search(
    current_user: CurrentUser,
    service: SearchServiceDep,
    q: Annotated[str, Query(min_length=1, max_length=200)],
    categories: Annotated[list[SearchCategory] | None, Query()] = None,
    limit_per_category: Annotated[int, Query(ge=1, le=20)] = 5,
) -> GlobalSearchResponse:
    result = await service.search(
        current_user,
        q,
        categories=categories,
        limit_per_category=limit_per_category,
    )
    return GlobalSearchResponse.from_page(result)


@router.get("/suggestions", response_model=SearchSuggestionResponse)
async def search_suggestions(
    current_user: CurrentUser,
    service: SearchServiceDep,
    q: Annotated[str, Query(min_length=1, max_length=200)],
    categories: Annotated[list[SearchCategory] | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=20)] = 8,
) -> SearchSuggestionResponse:
    suggestions = await service.suggest(current_user, q, categories=categories, limit=limit)
    return SearchSuggestionResponse(query=q.strip(), items=suggestions)


@router.get("/recent", response_model=RecentSearchResponse)
async def recent_searches(
    current_user: CurrentUser,
    service: SearchServiceDep,
    limit: Annotated[int, Query(ge=1, le=20)] = 10,
) -> RecentSearchResponse:
    queries = await service.recent(current_user, limit=limit)
    return RecentSearchResponse(items=queries)
