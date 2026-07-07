import { z } from "zod";

export const aiSettingsSchema = z.object({
  activeProvider: z.enum(["openai", "azure_openai", "gemini", "claude", "local_llm"]),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(1).max(128000),
});

export type AiSettingsFormValues = z.infer<typeof aiSettingsSchema>;

export const DEFAULT_AI_SETTINGS_FORM: AiSettingsFormValues = {
  activeProvider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2048,
};
