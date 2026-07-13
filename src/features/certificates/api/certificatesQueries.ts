import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { certificatesApi } from "./certificatesApi";
import type { CertificateListParams } from "../types/certificate.types";

export const certificatesQueryKeys = {
  all: ["certificates"] as const,
  lists: () => [...certificatesQueryKeys.all, "list"] as const,
  list: (params: CertificateListParams) => [...certificatesQueryKeys.lists(), params] as const,
  details: () => [...certificatesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...certificatesQueryKeys.details(), id] as const,
  print: (id: string) => [...certificatesQueryKeys.all, "print", id] as const,
};

export const certificatesListQueryOptions = (params: CertificateListParams) =>
  queryOptions({
    queryKey: certificatesQueryKeys.list(params),
    queryFn: () => certificatesApi.list(params),
    placeholderData: keepPreviousData,
  });

export const certificateDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: certificatesQueryKeys.detail(id ?? "unknown"),
    queryFn: () => certificatesApi.getById(id as string),
    enabled: Boolean(id),
  });

export const certificatePrintQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: certificatesQueryKeys.print(id ?? "unknown"),
    queryFn: () => certificatesApi.getPrintData(id as string),
    enabled: Boolean(id),
  });
