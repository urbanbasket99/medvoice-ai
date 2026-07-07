import { useQuery } from "@tanstack/react-query";

import { consultationsListQueryOptions, consultationsSearchQueryOptions } from "../api/consultationsQueries";
import type { ConsultationListParams, ConsultationSearchParams } from "../types/consultation.types";

export const useConsultations = (params: ConsultationListParams) =>
  useQuery(consultationsListQueryOptions(params));

export const useConsultationSearch = (params: ConsultationSearchParams) =>
  useQuery(consultationsSearchQueryOptions(params));
