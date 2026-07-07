import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appointmentsApi } from "./appointmentsApi";
import { appointmentsQueryKeys } from "./appointmentsQueries";
import type { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from "../types/appointment.types";

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all });
    },
  });
};

export interface UpdateAppointmentVariables {
  id: string;
  payload: UpdateAppointmentPayload;
}

export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateAppointmentVariables) => appointmentsApi.update(id, payload),
    onSuccess: (updated: Appointment) => {
      queryClient.setQueryData(appointmentsQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.searches() });
    },
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all });
    },
  });
};
