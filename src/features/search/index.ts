export { default as GlobalSearchBar } from "./components/GlobalSearchBar";
export { default as SearchDialog } from "./components/SearchDialog";
export { default as SearchResults } from "./components/SearchResults";
export { default as RecentSearches } from "./components/RecentSearches";
export { default as SearchFilters } from "./components/SearchFilters";
export { default as SearchResultCard } from "./components/SearchResultCard";

export { useGlobalSearch, useSearchSuggestions, useRecentSearches } from "./hooks/useGlobalSearch";
export { useGlobalSearchShortcut } from "./hooks/useGlobalSearchShortcut";
export { searchApi } from "./api/searchApi";

export type {
  SearchResult,
  SearchCategory,
  SearchGroup,
  GlobalSearchResult,
  SearchListParams,
} from "./types/search.types";

export { SEARCH_CATEGORY_LABELS, highlightMatch } from "./utils/searchUtils";
