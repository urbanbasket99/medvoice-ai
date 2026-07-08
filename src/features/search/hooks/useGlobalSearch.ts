import { useQuery } from "@tanstack/react-query";

import {
  globalSearchQueryOptions,
  recentSearchesQueryOptions,
  searchSuggestionsQueryOptions,
} from "../api/searchQueries";
import type { SearchListParams } from "../types/search.types";

export const useGlobalSearch = (params: SearchListParams) =>
  useQuery({
    ...globalSearchQueryOptions(params),
    placeholderData: (previous) => previous,
  });

export const useSearchSuggestions = (params: SearchListParams) =>
  useQuery(searchSuggestionsQueryOptions(params));

export const useRecentSearches = () => useQuery(recentSearchesQueryOptions());
