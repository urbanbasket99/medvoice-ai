import { useQuery } from "@tanstack/react-query";

import { labTestSearchQueryOptions } from "../api/laboratoryQueries";

export const useLabTestSearch = (query: string) => useQuery(labTestSearchQueryOptions(query));
