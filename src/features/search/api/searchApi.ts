import { httpClient } from "../../auth/api/httpClient";
import type {
  GlobalSearchApiResponse,
  RecentSearchApiResponse,
  SearchResultApiResponse,
  SearchSuggestionApiResponse,
} from "./searchApi.types";
import type {
  GlobalSearchResult,
  RecentSearchResult,
  SearchListParams,
  SearchResult,
  SearchSuggestionResult,
} from "../types/search.types";

const toSearchResult = (response: SearchResultApiResponse): SearchResult => ({
  id: response.id,
  category: response.category,
  title: response.title,
  subtitle: response.subtitle,
  description: response.description,
  route: response.route,
  highlight: response.highlight,
});

export const searchApi = {
  search: async (params: SearchListParams): Promise<GlobalSearchResult> => {
    const { data } = await httpClient.get<GlobalSearchApiResponse>("/search", {
      params: {
        q: params.query,
        categories: params.categories,
        limit_per_category: params.limitPerCategory,
      },
    });
    return {
      query: data.query,
      total: data.total,
      groups: data.groups.map((group) => ({
        category: group.category,
        label: group.label,
        items: group.items.map(toSearchResult),
      })),
    };
  },

  suggestions: async (params: SearchListParams): Promise<SearchSuggestionResult> => {
    const { data } = await httpClient.get<SearchSuggestionApiResponse>("/search/suggestions", {
      params: {
        q: params.query,
        categories: params.categories,
        limit: params.limitPerCategory ?? 8,
      },
    });
    return {
      query: data.query,
      items: data.items.map(toSearchResult),
    };
  },

  recent: async (): Promise<RecentSearchResult> => {
    const { data } = await httpClient.get<RecentSearchApiResponse>("/search/recent");
    return { items: data.items };
  },
};
