import { useQuery } from "@tanstack/react-query";

import { suppliersListQueryOptions } from "../api/pharmacyQueries";

export const useSuppliers = () => useQuery(suppliersListQueryOptions());
