import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { laboratoryApi } from "./laboratoryApi";
import type { LabOrderListParams, LabOrderSearchParams, LabTestListParams } from "../types/laboratory.types";

export const laboratoryQueryKeys = {
  all: ["laboratory"] as const,
  orders: () => [...laboratoryQueryKeys.all, "orders"] as const,
  lists: () => [...laboratoryQueryKeys.orders(), "list"] as const,
  list: (params: LabOrderListParams) => [...laboratoryQueryKeys.lists(), params] as const,
  searches: () => [...laboratoryQueryKeys.orders(), "search"] as const,
  search: (params: LabOrderSearchParams) => [...laboratoryQueryKeys.searches(), params] as const,
  details: () => [...laboratoryQueryKeys.orders(), "detail"] as const,
  detail: (id: string) => [...laboratoryQueryKeys.details(), id] as const,
  print: (id: string) => [...laboratoryQueryKeys.orders(), "print", id] as const,
  labTests: () => [...laboratoryQueryKeys.all, "lab-tests"] as const,
  labTestSearch: (query: string) => [...laboratoryQueryKeys.labTests(), "search", query] as const,
  labTestList: (params: LabTestListParams) => [...laboratoryQueryKeys.labTests(), "list", params] as const,
};

export const labOrdersListQueryOptions = (params: LabOrderListParams) =>
  queryOptions({
    queryKey: laboratoryQueryKeys.list(params),
    queryFn: () => laboratoryApi.list(params),
    placeholderData: keepPreviousData,
  });

export const labOrdersSearchQueryOptions = (params: LabOrderSearchParams) =>
  queryOptions({
    queryKey: laboratoryQueryKeys.search(params),
    queryFn: () => laboratoryApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const labOrderDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: laboratoryQueryKeys.detail(id ?? "unknown"),
    queryFn: () => laboratoryApi.getById(id as string),
    enabled: Boolean(id),
  });

export const labOrderPrintQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: laboratoryQueryKeys.print(id ?? "unknown"),
    queryFn: () => laboratoryApi.getPrintData(id as string),
    enabled: Boolean(id),
  });

export const labTestSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: laboratoryQueryKeys.labTestSearch(query),
    queryFn: () => laboratoryApi.searchLabTests(query),
    enabled: query.trim().length > 0,
  });

export const labTestListQueryOptions = (params: LabTestListParams) =>
  queryOptions({
    queryKey: laboratoryQueryKeys.labTestList(params),
    queryFn: () => laboratoryApi.listLabTests(params),
    placeholderData: keepPreviousData,
  });
