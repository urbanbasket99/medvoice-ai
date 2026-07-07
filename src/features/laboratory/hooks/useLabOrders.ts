import { useQuery } from "@tanstack/react-query";

import {
  labOrderDetailQueryOptions,
  labOrderPrintQueryOptions,
  labOrdersListQueryOptions,
  labOrdersSearchQueryOptions,
  labTestListQueryOptions,
} from "../api/laboratoryQueries";
import type { LabOrderListParams, LabOrderSearchParams, LabTestListParams } from "../types/laboratory.types";

export const useLabOrders = (params: LabOrderListParams) => useQuery(labOrdersListQueryOptions(params));

export const useLabOrderSearch = (params: LabOrderSearchParams) => useQuery(labOrdersSearchQueryOptions(params));

export const useLabOrder = (id: string | undefined) => useQuery(labOrderDetailQueryOptions(id));

export const useLabOrderPrint = (id: string | undefined) => useQuery(labOrderPrintQueryOptions(id));

export const useLabTests = (params: LabTestListParams) => useQuery(labTestListQueryOptions(params));
