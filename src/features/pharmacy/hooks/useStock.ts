import { useQuery } from "@tanstack/react-query";

import {
  lowStockQueryOptions,
  stockHistoryQueryOptions,
  stockInventoryQueryOptions,
} from "../api/pharmacyQueries";
import type { StockHistoryListParams, StockInventoryListParams } from "../types/pharmacy.types";

export const useStockInventory = (params: StockInventoryListParams) =>
  useQuery(stockInventoryQueryOptions(params));

export const useLowStock = () => useQuery(lowStockQueryOptions());

export const useStockHistory = (params: StockHistoryListParams) =>
  useQuery(stockHistoryQueryOptions(params));
