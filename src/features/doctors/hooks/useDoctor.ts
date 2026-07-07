import { useQuery } from "@tanstack/react-query";

import { doctorDetailQueryOptions } from "../api/doctorsQueries";

export const useDoctor = (id: string | undefined) => useQuery(doctorDetailQueryOptions(id));
