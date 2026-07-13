import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { billingApi } from "./billingApi";
import type {
  CollectionsReportParams,
  InvoiceListParams,
  InvoiceSearchParams,
  TpaListParams,
} from "../types/billing.types";

export const billingQueryKeys = {
  all: ["billing"] as const,
  invoices: () => [...billingQueryKeys.all, "invoices"] as const,
  lists: () => [...billingQueryKeys.invoices(), "list"] as const,
  list: (params: InvoiceListParams) => [...billingQueryKeys.lists(), params] as const,
  searches: () => [...billingQueryKeys.invoices(), "search"] as const,
  search: (params: InvoiceSearchParams) => [...billingQueryKeys.searches(), params] as const,
  details: () => [...billingQueryKeys.invoices(), "detail"] as const,
  detail: (id: string) => [...billingQueryKeys.details(), id] as const,
  outstanding: (params: InvoiceListParams) => [...billingQueryKeys.invoices(), "outstanding", params] as const,
  payments: (invoiceId: string) => [...billingQueryKeys.invoices(), "payments", invoiceId] as const,
  claims: (invoiceId: string) => [...billingQueryKeys.invoices(), "claims", invoiceId] as const,
  consultationCharges: (consultationId: string) =>
    [...billingQueryKeys.all, "consultation-charges", consultationId] as const,
  tpas: () => [...billingQueryKeys.all, "tpas"] as const,
  tpaLists: () => [...billingQueryKeys.tpas(), "list"] as const,
  tpaList: (params: TpaListParams) => [...billingQueryKeys.tpaLists(), params] as const,
  collectionsReport: (params: CollectionsReportParams) =>
    [...billingQueryKeys.all, "collections-report", params] as const,
};

export const invoicesListQueryOptions = (params: InvoiceListParams) =>
  queryOptions({
    queryKey: billingQueryKeys.list(params),
    queryFn: () => billingApi.list(params),
    placeholderData: keepPreviousData,
  });

export const invoicesSearchQueryOptions = (params: InvoiceSearchParams) =>
  queryOptions({
    queryKey: billingQueryKeys.search(params),
    queryFn: () => billingApi.search(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const invoiceDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: billingQueryKeys.detail(id ?? "unknown"),
    queryFn: () => billingApi.getById(id as string),
    enabled: Boolean(id),
  });

export const outstandingInvoicesQueryOptions = (params: InvoiceListParams) =>
  queryOptions({
    queryKey: billingQueryKeys.outstanding(params),
    queryFn: () => billingApi.listOutstanding(params),
    placeholderData: keepPreviousData,
  });

export const invoicePaymentsQueryOptions = (invoiceId: string | undefined) =>
  queryOptions({
    queryKey: billingQueryKeys.payments(invoiceId ?? "unknown"),
    queryFn: () => billingApi.listPayments(invoiceId as string),
    enabled: Boolean(invoiceId),
  });

export const invoiceClaimsQueryOptions = (invoiceId: string | undefined) =>
  queryOptions({
    queryKey: billingQueryKeys.claims(invoiceId ?? "unknown"),
    queryFn: () => billingApi.listClaims(invoiceId as string),
    enabled: Boolean(invoiceId),
  });

export const consultationChargesQueryOptions = (consultationId: string | undefined) =>
  queryOptions({
    queryKey: billingQueryKeys.consultationCharges(consultationId ?? "unknown"),
    queryFn: () => billingApi.getConsultationCharges(consultationId as string),
    enabled: Boolean(consultationId),
  });

export const tpasListQueryOptions = (params: TpaListParams) =>
  queryOptions({
    queryKey: billingQueryKeys.tpaList(params),
    queryFn: () => billingApi.listTpas(params),
    placeholderData: keepPreviousData,
  });

export const collectionsReportQueryOptions = (params: CollectionsReportParams, enabled = true) =>
  queryOptions({
    queryKey: billingQueryKeys.collectionsReport(params),
    queryFn: () => billingApi.getCollectionsReport(params),
    enabled: enabled && Boolean(params.dateFrom && params.dateTo),
  });
