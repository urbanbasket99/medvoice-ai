import { queryOptions } from "@tanstack/react-query";

import { searchApi } from "./searchApi";
import type { SearchCategory, SearchListParams } from "../types/search.types";

export const searchQueryKeys = {
  all: ["search"] as const,
  global: (params: SearchListParams) => [...searchQueryKeys.all, "global", params] as const,
  suggestions: (params: SearchListParams) => [...searchQueryKeys.all, "suggestions", params] as const,
  recent: () => [...searchQueryKeys.all, "recent"] as const,
};

export const globalSearchQueryOptions = (params: SearchListParams) =>
  queryOptions({
    queryKey: searchQueryKeys.global(params),
    queryFn: () => searchApi.search(params),
    enabled: params.query.trim().length >= 2,
  });

export const searchSuggestionsQueryOptions = (params: SearchListParams) =>
  queryOptions({
    queryKey: searchQueryKeys.suggestions(params),
    queryFn: () => searchApi.suggestions(params),
    enabled: params.query.trim().length >= 2,
  });

export const recentSearchesQueryOptions = () =>
  queryOptions({
    queryKey: searchQueryKeys.recent(),
    queryFn: () => searchApi.recent(),
  });

export const ALL_SEARCH_CATEGORIES: SearchCategory[] = [
  "patients",
  "doctors",
  "appointments",
  "consultations",
  "prescriptions",
  "laboratory_orders",
  "radiology_orders",
  "medicines",
  "invoices",
  "audit_logs",
];
