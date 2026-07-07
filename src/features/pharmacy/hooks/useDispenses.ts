import { useQuery } from "@tanstack/react-query";

import {
  dispenseDetailQueryOptions,
  dispensePrintQueryOptions,
  dispensesByPrescriptionQueryOptions,
  dispensesListQueryOptions,
  dispensesSearchQueryOptions,
} from "../api/pharmacyQueries";
import type { DispenseListParams, DispenseSearchParams } from "../types/pharmacy.types";

export const useDispenses = (params: DispenseListParams) => useQuery(dispensesListQueryOptions(params));

export const useDispenseSearch = (params: DispenseSearchParams) => useQuery(dispensesSearchQueryOptions(params));

export const useDispense = (id: string | undefined) => useQuery(dispenseDetailQueryOptions(id));

export const useDispensePrint = (id: string | undefined) => useQuery(dispensePrintQueryOptions(id));

export const useDispensesByPrescription = (prescriptionId: string | undefined) =>
  useQuery(dispensesByPrescriptionQueryOptions(prescriptionId));
