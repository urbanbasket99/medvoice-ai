import { useQuery } from "@tanstack/react-query";

import { radiologyTestSearchQueryOptions } from "../api/radiologyQueries";

export const useRadiologyTestSearch = (query: string) => useQuery(radiologyTestSearchQueryOptions(query));
