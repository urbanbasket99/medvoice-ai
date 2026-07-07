import { useQuery } from "@tanstack/react-query";

import { doctorsListQueryOptions, doctorsSearchQueryOptions } from "../api/doctorsQueries";
import type { DoctorListParams, DoctorSearchParams } from "../types/doctor.types";

export const useDoctors = (params: DoctorListParams) => useQuery(doctorsListQueryOptions(params));

export const useDoctorSearch = (params: DoctorSearchParams) =>
  useQuery(doctorsSearchQueryOptions(params));
