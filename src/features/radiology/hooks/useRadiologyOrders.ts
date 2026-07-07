import { useQuery } from "@tanstack/react-query";

import {
  radiologyOrderDetailQueryOptions,
  radiologyOrderPrintQueryOptions,
  radiologyOrdersListQueryOptions,
  radiologyOrdersSearchQueryOptions,
  radiologyTestListQueryOptions,
} from "../api/radiologyQueries";
import type { RadiologyOrderListParams, RadiologyOrderSearchParams, RadiologyTestListParams } from "../types/radiology.types";

export const useRadiologyOrders = (params: RadiologyOrderListParams) => useQuery(radiologyOrdersListQueryOptions(params));

export const useRadiologyOrderSearch = (params: RadiologyOrderSearchParams) => useQuery(radiologyOrdersSearchQueryOptions(params));

export const useRadiologyOrder = (id: string | undefined) => useQuery(radiologyOrderDetailQueryOptions(id));

export const useRadiologyOrderPrint = (id: string | undefined) => useQuery(radiologyOrderPrintQueryOptions(id));

export const useRadiologyTests = (params: RadiologyTestListParams) => useQuery(radiologyTestListQueryOptions(params));
