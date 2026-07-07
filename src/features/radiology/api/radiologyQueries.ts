import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { radiologyApi } from "./radiologyApi";
import type { RadiologyOrderListParams, RadiologyOrderSearchParams, RadiologyTestListParams } from "../types/radiology.types";

export const radiologyQueryKeys = {
  all: ["radiology"] as const,
  orders: () => [...radiologyQueryKeys.all, "orders"] as const,
  lists: () => [...radiologyQueryKeys.orders(), "list"] as const,
  list: (params: RadiologyOrderListParams) => [...radiologyQueryKeys.lists(), params] as const,
  searches: () => [...radiologyQueryKeys.orders(), "search"] as const,
  search: (params: RadiologyOrderSearchParams) => [...radiologyQueryKeys.searches(), params] as const,
  details: () => [...radiologyQueryKeys.orders(), "detail"] as const,
  detail: (id: string) => [...radiologyQueryKeys.details(), id] as const,
  print: (id: string) => [...radiologyQueryKeys.orders(), "print", id] as const,
  radiologyTests: () => [...radiologyQueryKeys.all, "radiology-tests"] as const,
  radiologyTestSearch: (query: string) => [...radiologyQueryKeys.radiologyTests(), "search", query] as const,
  radiologyTestList: (params: RadiologyTestListParams) => [...radiologyQueryKeys.radiologyTests(), "list", params] as const,
};

export const radiologyOrdersListQueryOptions = (params: RadiologyOrderListParams) =>
  queryOptions({
    queryKey: radiologyQueryKeys.list(params),
    queryFn: () => radiologyApi.list(params),
    placeholderData: keepPreviousData,
  });

export const radiologyOrdersSearchQueryOptions = (params: RadiologyOrderSearchParams) =>
  queryOptions({
    queryKey: radiologyQueryKeys.search(params),
    queryFn: () => radiologyApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const radiologyOrderDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: radiologyQueryKeys.detail(id ?? "unknown"),
    queryFn: () => radiologyApi.getById(id as string),
    enabled: Boolean(id),
  });

export const radiologyOrderPrintQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: radiologyQueryKeys.print(id ?? "unknown"),
    queryFn: () => radiologyApi.getPrintData(id as string),
    enabled: Boolean(id),
  });

export const radiologyTestSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: radiologyQueryKeys.radiologyTestSearch(query),
    queryFn: () => radiologyApi.searchRadiologyTests(query),
    enabled: query.trim().length > 0,
  });

export const radiologyTestListQueryOptions = (params: RadiologyTestListParams) =>
  queryOptions({
    queryKey: radiologyQueryKeys.radiologyTestList(params),
    queryFn: () => radiologyApi.listRadiologyTests(params),
    placeholderData: keepPreviousData,
  });
