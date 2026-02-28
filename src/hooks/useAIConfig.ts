import { useState, useCallback } from 'react';
import { AIConfig } from '../types/ai';
import { AI_CONFIG_STORAGE_KEY } from '../constants/ai';

function loadConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AIConfig;
  } catch {
    return null;
  }
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig | null>(loadConfig);

  const saveConfig = useCallback((newConfig: AIConfig) => {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
  }, []);

  const clearConfig = useCallback(() => {
    localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
    setConfig(null);
  }, []);

  return {
    config,
    isConfigured: config !== null && config.apiKey.length > 0,
    saveConfig,
    clearConfig,
  } as const;
}
