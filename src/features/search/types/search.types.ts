export type SearchCategory =
  | "patients"
  | "doctors"
  | "appointments"
  | "consultations"
  | "prescriptions"
  | "laboratory_orders"
  | "radiology_orders"
  | "medicines"
  | "invoices"
  | "audit_logs";

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  highlight: string | null;
}

export interface SearchGroup {
  category: SearchCategory;
  label: string;
  items: SearchResult[];
}

export interface GlobalSearchResult {
  query: string;
  total: number;
  groups: SearchGroup[];
}

export interface SearchListParams {
  query: string;
  categories?: SearchCategory[];
  limitPerCategory?: number;
}

export interface SearchSuggestionResult {
  query: string;
  items: SearchResult[];
}

export interface RecentSearchResult {
  items: string[];
}
