import { AIProvider, AIProviderMeta } from '../types/ai';

export const AI_PROVIDERS: AIProviderMeta[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini' },
    ],
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-20250414', name: 'Claude Haiku 4' },
    ],
    defaultModel: 'claude-sonnet-4-20250514',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    ],
    defaultModel: 'gemini-2.5-flash',
  },
];

export const AI_CONFIG_STORAGE_KEY = 'profit-calendar-ai-config';

export function getProviderMeta(provider: AIProvider): AIProviderMeta {
  const meta = AI_PROVIDERS.find((p) => p.id === provider);
  if (!meta) throw new Error(`Unknown provider: ${provider}`);
  return meta;
}
