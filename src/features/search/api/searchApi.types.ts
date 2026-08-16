import type { SearchCategory } from "../types/search.types";

export interface SearchResultApiResponse {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  highlight: string | null;
}

export interface SearchGroupApiResponse {
  category: SearchCategory;
  label: string;
  items: SearchResultApiResponse[];
}

export interface GlobalSearchApiResponse {
  query: string;
  total: number;
  groups: SearchGroupApiResponse[];
}

export interface SearchSuggestionApiResponse {
  query: string;
  items: SearchResultApiResponse[];
}

export interface RecentSearchApiResponse {
  items: string[];
}
