import { useQuery } from "@tanstack/react-query";

import { appointmentDetailQueryOptions } from "../api/appointmentsQueries";

export const useAppointment = (id: string | undefined) => useQuery(appointmentDetailQueryOptions(id));
