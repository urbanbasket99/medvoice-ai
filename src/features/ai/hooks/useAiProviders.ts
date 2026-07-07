import { useQuery } from "@tanstack/react-query";

import { aiHealthQueryOptions, aiModelsQueryOptions, aiProvidersQueryOptions } from "../api/aiQueries";
import type { ProviderId } from "../types/ai.types";

export const useAiProviders = () => useQuery(aiProvidersQueryOptions());

export const useAiModels = (providerId?: ProviderId) => useQuery(aiModelsQueryOptions(providerId));

export const useAiHealth = (providerId?: ProviderId) => useQuery(aiHealthQueryOptions(providerId));
