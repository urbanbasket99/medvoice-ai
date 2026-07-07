import { useQuery } from "@tanstack/react-query";

import {
  consultationChargesQueryOptions,
  invoiceDetailQueryOptions,
  invoicePaymentsQueryOptions,
  invoicesListQueryOptions,
  invoicesSearchQueryOptions,
  outstandingInvoicesQueryOptions,
} from "../api/billingQueries";
import type { InvoiceListParams, InvoiceSearchParams } from "../types/billing.types";

export const useInvoices = (params: InvoiceListParams) => useQuery(invoicesListQueryOptions(params));

export const useInvoiceSearch = (params: InvoiceSearchParams) => useQuery(invoicesSearchQueryOptions(params));

export const useInvoice = (id: string | undefined) => useQuery(invoiceDetailQueryOptions(id));

export const useOutstandingInvoices = (params: InvoiceListParams) =>
  useQuery(outstandingInvoicesQueryOptions(params));

export const useInvoicePayments = (invoiceId: string | undefined) =>
  useQuery(invoicePaymentsQueryOptions(invoiceId));

export const useConsultationCharges = (consultationId: string | undefined) =>
  useQuery(consultationChargesQueryOptions(consultationId));
