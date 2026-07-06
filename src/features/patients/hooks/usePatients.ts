import { useQuery } from "@tanstack/react-query";

import { patientsListQueryOptions, patientsSearchQueryOptions } from "../api/patientsQueries";
import type { PatientListParams, PatientSearchParams } from "../types/patient.types";

/** Paginated, sorted, filtered patient listing — backs `PatientListPage`'s grid. */
export const usePatients = (params: PatientListParams) => useQuery(patientsListQueryOptions(params));

/** Free-text search across UHID, name, mobile, and email. */
export const usePatientSearch = (params: PatientSearchParams) =>
  useQuery(patientsSearchQueryOptions(params));
