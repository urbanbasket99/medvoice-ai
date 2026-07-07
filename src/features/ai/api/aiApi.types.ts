import type { AiCapability, HealthStatus, ProviderId, ProviderStatus } from "../types/ai.types";

export interface AiProviderApiResponse {
  id: ProviderId;
  name: string;
  status: ProviderStatus;
  is_configured: boolean;
  capabilities: AiCapability[];
  description: string | null;
}

export interface AiSettingsApiResponse {
  active_provider: ProviderId;
  model: string;
  whisper_model: string;
  temperature: number;
  max_tokens: number;
  api_key_configured: boolean;
}

export interface AiProvidersCatalogApiResponse {
  providers: AiProviderApiResponse[];
  settings: AiSettingsApiResponse;
}

export interface AiModelApiResponse {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
}

export interface AiModelsListApiResponse {
  items: AiModelApiResponse[];
}

export interface AiHealthApiResponse {
  provider_id: ProviderId;
  status: HealthStatus;
  message: string;
  latency_ms: number | null;
  checked_at: string;
}

export interface UpdateAiSettingsRequestBody {
  active_provider?: ProviderId;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface TestAiRequestBody {
  prompt: string;
  provider_id?: ProviderId;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface TestAiApiResponse {
  text: string;
  model: string;
  provider_id: ProviderId;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
}
