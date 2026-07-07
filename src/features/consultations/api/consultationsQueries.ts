import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { consultationsApi } from "./consultationsApi";
import type { ConsultationListParams, ConsultationSearchParams } from "../types/consultation.types";

export const consultationsQueryKeys = {
  all: ["consultations"] as const,
  lists: () => [...consultationsQueryKeys.all, "list"] as const,
  list: (params: ConsultationListParams) => [...consultationsQueryKeys.lists(), params] as const,
  searches: () => [...consultationsQueryKeys.all, "search"] as const,
  search: (params: ConsultationSearchParams) => [...consultationsQueryKeys.searches(), params] as const,
  details: () => [...consultationsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...consultationsQueryKeys.details(), id] as const,
};

export const consultationsListQueryOptions = (params: ConsultationListParams) =>
  queryOptions({
    queryKey: consultationsQueryKeys.list(params),
    queryFn: () => consultationsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const consultationsSearchQueryOptions = (params: ConsultationSearchParams) =>
  queryOptions({
    queryKey: consultationsQueryKeys.search(params),
    queryFn: () => consultationsApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const consultationDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: consultationsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => consultationsApi.getById(id as string),
    enabled: Boolean(id),
  });
