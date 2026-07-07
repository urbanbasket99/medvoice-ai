import { queryOptions } from "@tanstack/react-query";

import { aiApi } from "./aiApi";
import type { ProviderId } from "../types/ai.types";

export const aiQueryKeys = {
  all: ["ai"] as const,
  providers: () => [...aiQueryKeys.all, "providers"] as const,
  settings: () => [...aiQueryKeys.all, "settings"] as const,
  models: (providerId?: ProviderId) => [...aiQueryKeys.all, "models", providerId ?? "active"] as const,
  health: (providerId?: ProviderId) => [...aiQueryKeys.all, "health", providerId ?? "active"] as const,
};

export const aiProvidersQueryOptions = () =>
  queryOptions({
    queryKey: aiQueryKeys.providers(),
    queryFn: () => aiApi.getProviders(),
  });

export const aiSettingsQueryOptions = () =>
  queryOptions({
    queryKey: aiQueryKeys.settings(),
    queryFn: () => aiApi.getSettings(),
  });

export const aiModelsQueryOptions = (providerId?: ProviderId) =>
  queryOptions({
    queryKey: aiQueryKeys.models(providerId),
    queryFn: () => aiApi.getModels(providerId),
    enabled: Boolean(providerId),
  });

export const aiHealthQueryOptions = (providerId?: ProviderId) =>
  queryOptions({
    queryKey: aiQueryKeys.health(providerId),
    queryFn: () => aiApi.getHealth(providerId),
    enabled: Boolean(providerId),
    staleTime: 0,
  });
