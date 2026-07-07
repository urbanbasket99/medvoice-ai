import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { prescriptionsApi } from "./prescriptionsApi";
import type { PrescriptionListParams, PrescriptionSearchParams } from "../types/prescription.types";

export const prescriptionsQueryKeys = {
  all: ["prescriptions"] as const,
  lists: () => [...prescriptionsQueryKeys.all, "list"] as const,
  list: (params: PrescriptionListParams) => [...prescriptionsQueryKeys.lists(), params] as const,
  searches: () => [...prescriptionsQueryKeys.all, "search"] as const,
  search: (params: PrescriptionSearchParams) => [...prescriptionsQueryKeys.searches(), params] as const,
  details: () => [...prescriptionsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...prescriptionsQueryKeys.details(), id] as const,
  print: (id: string) => [...prescriptionsQueryKeys.all, "print", id] as const,
  medicines: () => [...prescriptionsQueryKeys.all, "medicines"] as const,
  medicineSearch: (query: string) => [...prescriptionsQueryKeys.medicines(), query] as const,
};

export const prescriptionsListQueryOptions = (params: PrescriptionListParams) =>
  queryOptions({
    queryKey: prescriptionsQueryKeys.list(params),
    queryFn: () => prescriptionsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const prescriptionsSearchQueryOptions = (params: PrescriptionSearchParams) =>
  queryOptions({
    queryKey: prescriptionsQueryKeys.search(params),
    queryFn: () => prescriptionsApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const prescriptionDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: prescriptionsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => prescriptionsApi.getById(id as string),
    enabled: Boolean(id),
  });

export const prescriptionPrintQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: prescriptionsQueryKeys.print(id ?? "unknown"),
    queryFn: () => prescriptionsApi.getPrintData(id as string),
    enabled: Boolean(id),
  });

export const medicineSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: prescriptionsQueryKeys.medicineSearch(query),
    queryFn: () => prescriptionsApi.searchMedicines(query),
    enabled: query.trim().length > 0,
  });
