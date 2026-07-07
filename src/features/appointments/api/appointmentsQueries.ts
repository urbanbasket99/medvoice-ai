import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { appointmentsApi } from "./appointmentsApi";
import type { AppointmentListParams, AppointmentSearchParams } from "../types/appointment.types";

export const appointmentsQueryKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentsQueryKeys.all, "list"] as const,
  list: (params: AppointmentListParams) => [...appointmentsQueryKeys.lists(), params] as const,
  searches: () => [...appointmentsQueryKeys.all, "search"] as const,
  search: (params: AppointmentSearchParams) => [...appointmentsQueryKeys.searches(), params] as const,
  details: () => [...appointmentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentsQueryKeys.details(), id] as const,
};

export const appointmentsListQueryOptions = (params: AppointmentListParams) =>
  queryOptions({
    queryKey: appointmentsQueryKeys.list(params),
    queryFn: () => appointmentsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const appointmentsSearchQueryOptions = (params: AppointmentSearchParams) =>
  queryOptions({
    queryKey: appointmentsQueryKeys.search(params),
    queryFn: () => appointmentsApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const appointmentDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: appointmentsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => appointmentsApi.getById(id as string),
    enabled: Boolean(id),
  });
