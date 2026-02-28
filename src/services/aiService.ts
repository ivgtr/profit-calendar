import { AIConfig, AIProvider } from '../types/ai';

interface ProviderStrategy {
  buildRequest(
    prompt: string,
    model: string,
    apiKey: string,
    customEndpoint?: string
  ): { url: string; init: RequestInit };
  parseResponse(json: unknown): string;
}

// ---------- OpenAI ----------
const openai: ProviderStrategy = {
  buildRequest(prompt, model, apiKey) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      },
    };
  },
  parseResponse(json) {
    const data = json as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (data.error?.message) throw new Error(data.error.message);
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenAI: レスポンスにコンテンツがありません');
    return content;
  },
};

// ---------- Anthropic ----------
const anthropic: ProviderStrategy = {
  buildRequest(prompt, model, apiKey) {
    return {
      url: 'https://api.anthropic.com/v1/messages',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    };
  },
  parseResponse(json) {
    const data = json as {
      content?: { type: string; text?: string }[];
      error?: { message?: string };
    };
    if (data.error?.message) throw new Error(data.error.message);
    const text = data.content?.find((b) => b.type === 'text')?.text;
    if (!text) throw new Error('Anthropic: レスポンスにコンテンツがありません');
    return text;
  },
};

// ---------- Gemini ----------
const gemini: ProviderStrategy = {
  buildRequest(prompt, model, apiKey) {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    };
  },
  parseResponse(json) {
    const data = json as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };
    if (data.error?.message) throw new Error(data.error.message);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini: レスポンスにコンテンツがありません');
    return text;
  },
};

// ---------- OpenAI Compatible ----------
const openaiCompatible: ProviderStrategy = {
  buildRequest(prompt, model, apiKey, customEndpoint) {
    const baseUrl = (customEndpoint ?? '').replace(/\/+$/, '');
    if (!baseUrl) throw new Error('OpenAI互換: エンドポイントURLが設定されていません');

    const url = baseUrl.endsWith('/chat/completions')
      ? baseUrl
      : `${baseUrl}/chat/completions`;

    return {
      url,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      },
    };
  },
  parseResponse: openai.parseResponse,
};

// ---------- Strategy Map ----------
const strategies: Record<AIProvider, ProviderStrategy> = {
  openai,
  anthropic,
  gemini,
  'openai-compatible': openaiCompatible,
};

// ---------- Public API ----------

export async function analyzeWithAI(
  config: AIConfig,
  statisticsJson: string,
  promptText: string
): Promise<string> {
  const strategy = strategies[config.provider];
  const fullPrompt = `${promptText}\n\n## 統計データ (JSON)\n\`\`\`json\n${statisticsJson}\n\`\`\``;
  const { url, init } = strategy.buildRequest(fullPrompt, config.model, config.apiKey, config.customEndpoint);

  const response = await fetch(url, init);
  const json: unknown = await response.json();

  if (!response.ok) {
    // Try to extract error message from response
    const errMsg =
      (json as { error?: { message?: string } })?.error?.message ??
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errMsg);
  }

  return strategy.parseResponse(json);
}

export async function testConnection(config: AIConfig): Promise<void> {
  const strategy = strategies[config.provider];
  const { url, init } = strategy.buildRequest('Hello', config.model, config.apiKey, config.customEndpoint);

  const response = await fetch(url, init);
  const json: unknown = await response.json();

  if (!response.ok) {
    const errMsg =
      (json as { error?: { message?: string } })?.error?.message ??
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errMsg);
  }

  // Validate we can parse
  strategy.parseResponse(json);
}
