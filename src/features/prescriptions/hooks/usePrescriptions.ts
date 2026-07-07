import { useQuery } from "@tanstack/react-query";

import {
  medicineSearchQueryOptions,
  prescriptionDetailQueryOptions,
  prescriptionPrintQueryOptions,
  prescriptionsListQueryOptions,
  prescriptionsSearchQueryOptions,
} from "../api/prescriptionsQueries";
import type { PrescriptionListParams, PrescriptionSearchParams } from "../types/prescription.types";

export const usePrescriptions = (params: PrescriptionListParams) => useQuery(prescriptionsListQueryOptions(params));

export const usePrescriptionSearch = (params: PrescriptionSearchParams) =>
  useQuery(prescriptionsSearchQueryOptions(params));

export const usePrescription = (id: string | undefined) => useQuery(prescriptionDetailQueryOptions(id));

export const usePrescriptionPrint = (id: string | undefined) => useQuery(prescriptionPrintQueryOptions(id));

export const useMedicineSearch = (query: string) => useQuery(medicineSearchQueryOptions(query));
