import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { patientsApi } from "./patientsApi";
import type { PatientListParams, PatientSearchParams } from "../types/patient.types";

export const patientsQueryKeys = {
  all: ["patients"] as const,
  lists: () => [...patientsQueryKeys.all, "list"] as const,
  list: (params: PatientListParams) => [...patientsQueryKeys.lists(), params] as const,
  searches: () => [...patientsQueryKeys.all, "search"] as const,
  search: (params: PatientSearchParams) => [...patientsQueryKeys.searches(), params] as const,
  details: () => [...patientsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...patientsQueryKeys.details(), id] as const,
};

export const patientsListQueryOptions = (params: PatientListParams) =>
  queryOptions({
    queryKey: patientsQueryKeys.list(params),
    queryFn: () => patientsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const patientsSearchQueryOptions = (params: PatientSearchParams) =>
  queryOptions({
    queryKey: patientsQueryKeys.search(params),
    queryFn: () => patientsApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const patientDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: patientsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => patientsApi.getById(id as string),
    enabled: Boolean(id),
  });
