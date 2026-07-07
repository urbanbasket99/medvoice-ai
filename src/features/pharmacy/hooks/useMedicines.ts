import { useQuery } from "@tanstack/react-query";

import {
  medicineDetailQueryOptions,
  medicinesListQueryOptions,
  medicineSearchQueryOptions,
} from "../api/pharmacyQueries";
import type { PharmacyMedicineListParams } from "../types/pharmacy.types";

export const useMedicines = (params: PharmacyMedicineListParams) =>
  useQuery(medicinesListQueryOptions(params));

export const useMedicineSearch = (query: string) => useQuery(medicineSearchQueryOptions(query));

export const useMedicine = (id: string | undefined) => useQuery(medicineDetailQueryOptions(id));
