import { httpClient } from "../../auth/api/httpClient";
import type {
  AiHealthApiResponse,
  AiModelsListApiResponse,
  AiProvidersCatalogApiResponse,
  AiSettingsApiResponse,
  TestAiApiResponse,
  TestAiRequestBody,
  UpdateAiSettingsRequestBody,
} from "./aiApi.types";
import type {
  AiHealth,
  AiModel,
  AiProvidersCatalog,
  AiProvider,
  AiSettings,
  TestAiPayload,
  TestAiResult,
  UpdateAiSettingsPayload,
} from "../types/ai.types";

const toProvider = (response: AiProvidersCatalogApiResponse["providers"][number]): AiProvider => ({
  id: response.id,
  name: response.name,
  status: response.status,
  isConfigured: response.is_configured,
  capabilities: response.capabilities,
  description: response.description,
});

const toSettings = (response: AiSettingsApiResponse): AiSettings => ({
  activeProvider: response.active_provider,
  model: response.model,
  whisperModel: response.whisper_model,
  temperature: response.temperature,
  maxTokens: response.max_tokens,
  apiKeyConfigured: response.api_key_configured,
});

const toCatalog = (response: AiProvidersCatalogApiResponse): AiProvidersCatalog => ({
  providers: response.providers.map(toProvider),
  settings: toSettings(response.settings),
});

const toModel = (response: AiModelsListApiResponse["items"][number]): AiModel => ({
  id: response.id,
  name: response.name,
  description: response.description,
  isDefault: response.is_default,
});

const toHealth = (response: AiHealthApiResponse): AiHealth => ({
  providerId: response.provider_id,
  status: response.status,
  message: response.message,
  latencyMs: response.latency_ms,
  checkedAt: response.checked_at,
});

const toTestResult = (response: TestAiApiResponse): TestAiResult => ({
  text: response.text,
  model: response.model,
  providerId: response.provider_id,
  promptTokens: response.prompt_tokens,
  completionTokens: response.completion_tokens,
  totalTokens: response.total_tokens,
});

export const aiApi = {
  async getProviders(): Promise<AiProvidersCatalog> {
    const { data } = await httpClient.get<AiProvidersCatalogApiResponse>("/ai/providers");
    return toCatalog(data);
  },

  async getSettings(): Promise<AiSettings> {
    const { data } = await httpClient.get<AiSettingsApiResponse>("/ai/settings");
    return toSettings(data);
  },

  async updateSettings(payload: UpdateAiSettingsPayload): Promise<AiSettings> {
    const body: UpdateAiSettingsRequestBody = {
      active_provider: payload.activeProvider,
      model: payload.model,
      temperature: payload.temperature,
      max_tokens: payload.maxTokens,
    };
    const { data } = await httpClient.put<AiSettingsApiResponse>("/ai/settings", body);
    return toSettings(data);
  },

  async getModels(providerId?: string): Promise<AiModel[]> {
    const { data } = await httpClient.get<AiModelsListApiResponse>("/ai/models", {
      params: providerId ? { provider_id: providerId } : undefined,
    });
    return data.items.map(toModel);
  },

  async getHealth(providerId?: string): Promise<AiHealth> {
    const { data } = await httpClient.get<AiHealthApiResponse>("/ai/health", {
      params: providerId ? { provider_id: providerId } : undefined,
    });
    return toHealth(data);
  },

  async test(payload: TestAiPayload): Promise<TestAiResult> {
    const body: TestAiRequestBody = {
      prompt: payload.prompt,
      provider_id: payload.providerId,
      model: payload.model,
      temperature: payload.temperature,
      max_tokens: payload.maxTokens,
    };
    const { data } = await httpClient.post<TestAiApiResponse>("/ai/test", body);
    return toTestResult(data);
  },
};
