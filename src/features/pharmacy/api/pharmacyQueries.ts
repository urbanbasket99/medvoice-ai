import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { pharmacyApi } from "./pharmacyApi";
import type {
  DispenseListParams,
  DispenseSearchParams,
  PharmacyBatchListParams,
  PharmacyMedicineListParams,
  StockHistoryListParams,
  StockInventoryListParams,
} from "../types/pharmacy.types";

export const pharmacyQueryKeys = {
  all: ["pharmacy"] as const,
  medicines: () => [...pharmacyQueryKeys.all, "medicines"] as const,
  medicineLists: () => [...pharmacyQueryKeys.medicines(), "list"] as const,
  medicineList: (params: PharmacyMedicineListParams) => [...pharmacyQueryKeys.medicineLists(), params] as const,
  medicineSearches: () => [...pharmacyQueryKeys.medicines(), "search"] as const,
  medicineSearch: (query: string) => [...pharmacyQueryKeys.medicineSearches(), query] as const,
  medicineDetails: () => [...pharmacyQueryKeys.medicines(), "detail"] as const,
  medicineDetail: (id: string) => [...pharmacyQueryKeys.medicineDetails(), id] as const,
  batches: () => [...pharmacyQueryKeys.all, "batches"] as const,
  batchList: (params: PharmacyBatchListParams) => [...pharmacyQueryKeys.batches(), params] as const,
  stock: () => [...pharmacyQueryKeys.all, "stock"] as const,
  inventory: (params: StockInventoryListParams) => [...pharmacyQueryKeys.stock(), "inventory", params] as const,
  lowStock: () => [...pharmacyQueryKeys.stock(), "low"] as const,
  stockHistory: (params: StockHistoryListParams) => [...pharmacyQueryKeys.stock(), "history", params] as const,
  dispenses: () => [...pharmacyQueryKeys.all, "dispenses"] as const,
  dispenseLists: () => [...pharmacyQueryKeys.dispenses(), "list"] as const,
  dispenseList: (params: DispenseListParams) => [...pharmacyQueryKeys.dispenseLists(), params] as const,
  dispenseSearches: () => [...pharmacyQueryKeys.dispenses(), "search"] as const,
  dispenseSearch: (params: DispenseSearchParams) => [...pharmacyQueryKeys.dispenseSearches(), params] as const,
  dispenseDetails: () => [...pharmacyQueryKeys.dispenses(), "detail"] as const,
  dispenseDetail: (id: string) => [...pharmacyQueryKeys.dispenseDetails(), id] as const,
  dispensePrint: (id: string) => [...pharmacyQueryKeys.dispenses(), "print", id] as const,
  dispenseByPrescription: (prescriptionId: string) =>
    [...pharmacyQueryKeys.dispenses(), "by-prescription", prescriptionId] as const,
  suppliers: () => [...pharmacyQueryKeys.all, "suppliers"] as const,
};

export const medicinesListQueryOptions = (params: PharmacyMedicineListParams) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.medicineList(params),
    queryFn: () => pharmacyApi.listMedicines(params),
    placeholderData: keepPreviousData,
  });

export const medicineSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.medicineSearch(query),
    queryFn: () => pharmacyApi.searchMedicines(query),
    enabled: query.trim().length > 0,
  });

export const medicineDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.medicineDetail(id ?? "unknown"),
    queryFn: () => pharmacyApi.getMedicine(id as string),
    enabled: Boolean(id),
  });

export const batchesListQueryOptions = (params: PharmacyBatchListParams) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.batchList(params),
    queryFn: () => pharmacyApi.listBatches(params),
    enabled: Boolean(params.medicineId),
  });

export const stockInventoryQueryOptions = (params: StockInventoryListParams) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.inventory(params),
    queryFn: () => pharmacyApi.getInventory(params),
    placeholderData: keepPreviousData,
  });

export const lowStockQueryOptions = () =>
  queryOptions({
    queryKey: pharmacyQueryKeys.lowStock(),
    queryFn: () => pharmacyApi.getLowStock(),
  });

export const stockHistoryQueryOptions = (params: StockHistoryListParams) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.stockHistory(params),
    queryFn: () => pharmacyApi.getStockHistory(params),
    placeholderData: keepPreviousData,
  });

export const dispensesListQueryOptions = (params: DispenseListParams) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.dispenseList(params),
    queryFn: () => pharmacyApi.listDispenses(params),
    placeholderData: keepPreviousData,
  });

export const dispensesSearchQueryOptions = (params: DispenseSearchParams) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.dispenseSearch(params),
    queryFn: () => pharmacyApi.searchDispenses(params),
    enabled: params.query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const dispenseDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.dispenseDetail(id ?? "unknown"),
    queryFn: () => pharmacyApi.getDispense(id as string),
    enabled: Boolean(id),
  });

export const dispensePrintQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.dispensePrint(id ?? "unknown"),
    queryFn: () => pharmacyApi.getDispensePrintData(id as string),
    enabled: Boolean(id),
  });

export const dispensesByPrescriptionQueryOptions = (prescriptionId: string | undefined) =>
  queryOptions({
    queryKey: pharmacyQueryKeys.dispenseByPrescription(prescriptionId ?? "unknown"),
    queryFn: () => pharmacyApi.getDispensesByPrescription(prescriptionId as string),
    enabled: Boolean(prescriptionId),
  });

export const suppliersListQueryOptions = () =>
  queryOptions({
    queryKey: pharmacyQueryKeys.suppliers(),
    queryFn: () => pharmacyApi.listSuppliers(),
  });
