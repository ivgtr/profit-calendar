export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
}

export interface AIProviderMeta {
  id: AIProvider;
  name: string;
  models: { id: string; name: string }[];
  defaultModel: string;
}
