import { useQuery } from "@tanstack/react-query";

import { patientDetailQueryOptions } from "../api/patientsQueries";

/** A single patient by id — backs `PatientDetailsPage` and `PatientEditPage`. */
export const usePatient = (id: string | undefined) => useQuery(patientDetailQueryOptions(id));
