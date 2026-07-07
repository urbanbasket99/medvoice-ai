import { useQuery } from "@tanstack/react-query";

import { batchesListQueryOptions } from "../api/pharmacyQueries";
import type { PharmacyBatchListParams } from "../types/pharmacy.types";

export const useBatches = (params: PharmacyBatchListParams) => useQuery(batchesListQueryOptions(params));
