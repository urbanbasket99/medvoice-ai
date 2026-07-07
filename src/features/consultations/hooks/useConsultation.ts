import { useQuery } from "@tanstack/react-query";

import { consultationDetailQueryOptions } from "../api/consultationsQueries";

export const useConsultation = (id: string | undefined) => useQuery(consultationDetailQueryOptions(id));
