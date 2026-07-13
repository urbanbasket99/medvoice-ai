import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { doctorsApi } from "./doctorsApi";
import type { DoctorListParams, DoctorSearchParams } from "../types/doctor.types";

export const doctorsQueryKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorsQueryKeys.all, "list"] as const,
  list: (params: DoctorListParams) => [...doctorsQueryKeys.lists(), params] as const,
  searches: () => [...doctorsQueryKeys.all, "search"] as const,
  search: (params: DoctorSearchParams) => [...doctorsQueryKeys.searches(), params] as const,
  details: () => [...doctorsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorsQueryKeys.details(), id] as const,
  availability: (id: string) => [...doctorsQueryKeys.all, "availability", id] as const,
};

export const doctorsListQueryOptions = (params: DoctorListParams) =>
  queryOptions({
    queryKey: doctorsQueryKeys.list(params),
    queryFn: () => doctorsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const doctorsSearchQueryOptions = (params: DoctorSearchParams) =>
  queryOptions({
    queryKey: doctorsQueryKeys.search(params),
    queryFn: () => doctorsApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const doctorDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: doctorsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => doctorsApi.getById(id as string),
    enabled: Boolean(id),
  });

export const doctorAvailabilityQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: doctorsQueryKeys.availability(id ?? "unknown"),
    queryFn: () => doctorsApi.getAvailability(id as string),
    enabled: Boolean(id),
  });
