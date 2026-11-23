/**
 * Provider presets for sight-mcp.
 *
 * Default behaviour is unchanged (OpenAI, OPENAI_API_KEY, API_URL, MODEL).
 * Set PROVIDER=meta to use the Meta Model API (dev.meta.ai):
 *   - base URL defaults to https://api.meta.ai/v1/chat/completions
 *   - model defaults to muse-spark-1.3 (multimodal: images, video, audio)
 *   - key is read from MODEL_API_KEY (falls back to OPENAI_API_KEY)
 * API_URL / MODEL still override the preset when set explicitly.
 */
export interface ProviderConfig {
  provider: string;
  apiUrl: string;
  model: string;
  apiKey: string | undefined;
  apiKeyEnv: string;
}

export const META_BASE_URL = "https://api.meta.ai/v1";
export const META_DEFAULT_MODEL = "muse-spark-1.3";

export function resolveProviderConfig(
  env: Record<string, string | undefined> = process.env,
): ProviderConfig {
  const provider = (env.PROVIDER || "").toLowerCase();
  if (provider === "meta") {
    return {
      provider: "meta",
      apiUrl: env.API_URL || `${META_BASE_URL}/chat/completions`,
      model: env.MODEL || META_DEFAULT_MODEL,
      apiKey: env.MODEL_API_KEY || env.OPENAI_API_KEY,
      apiKeyEnv: "MODEL_API_KEY",
    };
  }
  return {
    provider: provider || "openai",
    apiUrl: env.API_URL || "https://api.openai.com/v1/chat/completions",
    model: env.MODEL || "gpt-4o",
    apiKey: env.OPENAI_API_KEY,
    apiKeyEnv: "OPENAI_API_KEY",
  };
}
