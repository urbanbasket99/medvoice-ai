import { useQuery } from "@tanstack/react-query";

import { appointmentsListQueryOptions, appointmentsSearchQueryOptions } from "../api/appointmentsQueries";
import type { AppointmentListParams, AppointmentSearchParams } from "../types/appointment.types";

export const useAppointments = (params: AppointmentListParams) =>
  useQuery(appointmentsListQueryOptions(params));

export const useAppointmentSearch = (params: AppointmentSearchParams) =>
  useQuery(appointmentsSearchQueryOptions(params));
