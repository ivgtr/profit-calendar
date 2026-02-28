export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface AIProviderMeta {
  id: AIProvider;
  name: string;
  models: { id: string; name: string }[];
  defaultModel: string;
}
