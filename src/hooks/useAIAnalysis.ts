import { useState, useCallback } from 'react';
import { useAIConfig } from './useAIConfig';
import { analyzeWithAI } from '../services/aiService';
import { AIPromptTemplate } from '../types/statistics';

interface AIAnalysisCache {
  result: string;
  promptType: AIPromptTemplate;
  timestamp: number;
  provider: string;
  model: string;
}

const CACHE_PREFIX = 'profit-calendar-ai-analysis-';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function loadCache(cacheKey: string): AIAnalysisCache | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (!raw) return null;
    const cache: AIAnalysisCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + cacheKey);
      return null;
    }
    return cache;
  } catch {
    return null;
  }
}

function saveCache(cacheKey: string, data: AIAnalysisCache): void {
  try {
    localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(data));
  } catch {
    // localStorage full — ignore
  }
}

function clearCache(cacheKey: string): void {
  localStorage.removeItem(CACHE_PREFIX + cacheKey);
}

export interface UseAIAnalysisReturn {
  result: string | null;
  isLoading: boolean;
  error: string | null;
  isCached: boolean;
  cacheTimestamp: number | null;
  runAnalysis: (dataJson: string, promptText: string, promptType: AIPromptTemplate) => Promise<void>;
  clearResult: () => void;
  isConfigured: boolean;
}

/**
 * AI分析の実行・キャッシュ管理フック
 * @param cacheKey キャッシュ識別キー（例: "monthly-2026-02"）
 */
export function useAIAnalysis(cacheKey: string): UseAIAnalysisReturn {
  const { config, isConfigured } = useAIConfig();

  const cached = loadCache(cacheKey);
  const [result, setResult] = useState<string | null>(cached?.result ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(cached !== null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(cached?.timestamp ?? null);

  const runAnalysis = useCallback(
    async (dataJson: string, promptText: string, promptType: AIPromptTemplate) => {
      if (!config) return;

      setIsLoading(true);
      setError(null);
      setIsCached(false);

      try {
        const analysisResult = await analyzeWithAI(config, dataJson, promptText);
        setResult(analysisResult);

        const now = Date.now();
        setCacheTimestamp(now);
        setIsCached(false);

        saveCache(cacheKey, {
          result: analysisResult,
          promptType,
          timestamp: now,
          provider: config.provider,
          model: config.model,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'AI分析に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
    [config, cacheKey],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setIsCached(false);
    setCacheTimestamp(null);
    clearCache(cacheKey);
  }, [cacheKey]);

  return {
    result,
    isLoading,
    error,
    isCached,
    cacheTimestamp,
    runAnalysis,
    clearResult,
    isConfigured,
  };
}
