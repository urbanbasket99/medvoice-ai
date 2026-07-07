export type ProviderId = "openai" | "azure_openai" | "gemini" | "claude" | "local_llm";
export type ProviderStatus = "active" | "placeholder" | "unavailable";
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "not_configured";
export type AiCapability =
  | "speech_to_text"
  | "text_completion"
  | "structured_json"
  | "streaming"
  | "health_check";

export interface AiProvider {
  id: ProviderId;
  name: string;
  status: ProviderStatus;
  isConfigured: boolean;
  capabilities: AiCapability[];
  description: string | null;
}

export interface AiSettings {
  activeProvider: ProviderId;
  model: string;
  whisperModel: string;
  temperature: number;
  maxTokens: number;
  apiKeyConfigured: boolean;
}

export interface AiProvidersCatalog {
  providers: AiProvider[];
  settings: AiSettings;
}

export interface AiModel {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

export interface AiHealth {
  providerId: ProviderId;
  status: HealthStatus;
  message: string;
  latencyMs: number | null;
  checkedAt: string;
}

export interface UpdateAiSettingsPayload {
  activeProvider?: ProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TestAiPayload {
  prompt: string;
  providerId?: ProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TestAiResult {
  text: string;
  model: string;
  providerId: ProviderId;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}
