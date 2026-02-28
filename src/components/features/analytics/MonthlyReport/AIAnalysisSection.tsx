import { useState, useCallback, useMemo, memo } from 'react';
import { MonthlyStatsData } from '../../../../hooks/useMonthlyStats';
import { useAIAnalysis } from '../../../../hooks/useAIAnalysis';
import { AI_PROMPTS, PROMPT_DESCRIPTIONS } from '../../../../constants/aiPrompts';
import { AIPromptTemplate } from '../../../../types/statistics';
import { AIAnalysisResult } from '../../ai-analysis/AIAnalysisResult';
import { Button } from '../../../ui/base/Button';
import { formatMonthYear } from '../../../../utils/formatUtils';
import { aiAnalysisHistoryService, type AIAnalysisRecord } from '../../../../services/aiAnalysisHistory';
import './AIAnalysisSection.css';

/** monthly / basic / stock の3種類だけ月次レポートでは選択可能にする */
const MONTHLY_PROMPT_OPTIONS: { key: AIPromptTemplate; label: string }[] = [
  { key: 'monthly', label: '月次分析' },
  { key: 'basic', label: '総合分析' },
  { key: 'stock', label: '銘柄別分析' },
  { key: 'score', label: 'スコア評価' },
];

interface AIAnalysisSectionProps {
  stats: MonthlyStatsData;
  reportMonth: Date;
}

/** MonthlyStatsData から AI に送る JSON 文字列を組み立てる */
function buildStatsJson(stats: MonthlyStatsData, reportMonth: Date): string {
  const { trades, ...statsWithoutTrades } = stats;

  const tradesSummary = trades.map(t => ({
    date: t.date instanceof Date ? t.date.toISOString().slice(0, 10) : t.date,
    stockName: t.stockName,
    stockCode: t.stockCode,
    tradeType: t.tradeType,
    realizedProfitLoss: t.realizedProfitLoss,
    quantity: t.quantity,
    amount: t.amount,
  }));

  return JSON.stringify(
    {
      month: `${reportMonth.getFullYear()}-${String(reportMonth.getMonth() + 1).padStart(2, '0')}`,
      ...statsWithoutTrades,
      trades: tradesSummary,
    },
    null,
    2,
  );
}

const AIAnalysisSection = memo(function AIAnalysisSection({ stats, reportMonth }: AIAnalysisSectionProps) {
  const monthKey = `${reportMonth.getFullYear()}-${String(reportMonth.getMonth() + 1).padStart(2, '0')}`;
  const cacheKey = `monthly-${monthKey}`;

  const [selectedPrompt, setSelectedPrompt] = useState<AIPromptTemplate>('monthly');
  const { result, isLoading, error, isCached, cacheTimestamp, runAnalysis, clearResult, isConfigured } =
    useAIAnalysis(cacheKey);

  const statsJson = useMemo(() => buildStatsJson(stats, reportMonth), [stats, reportMonth]);

  const handleRunAnalysis = useCallback(async () => {
    const promptText = AI_PROMPTS[selectedPrompt];
    await runAnalysis(statsJson, promptText, selectedPrompt);
  }, [runAnalysis, statsJson, selectedPrompt]);

  const handleSaveToHistory = useCallback(async () => {
    if (!result) return;
    const record: Omit<AIAnalysisRecord, 'id'> = {
      month: monthKey,
      promptType: selectedPrompt,
      result,
      createdAt: cacheTimestamp ? new Date(cacheTimestamp) : new Date(),
    };
    await aiAnalysisHistoryService.save(record);
  }, [result, monthKey, selectedPrompt, cacheTimestamp]);

  if (!isConfigured) {
    return (
      <div className="stats-section ai-analysis-section">
        <h3>AI分析</h3>
        <div className="ai-analysis-unconfigured">
          <p>AI分析を利用するには、設定画面でAI APIキーを設定してください。</p>
          <p className="ai-analysis-unconfigured__hint">
            ヘッダーメニュー &gt; 設定 &gt; AI連携タブ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-section ai-analysis-section">
      <h3>AI分析</h3>

      <div className="ai-analysis-controls">
        <div className="ai-analysis-prompt-selector">
          {MONTHLY_PROMPT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              className={`ai-analysis-prompt-chip ${selectedPrompt === key ? 'ai-analysis-prompt-chip--active' : ''}`}
              onClick={() => setSelectedPrompt(key)}
              disabled={isLoading}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="ai-analysis-prompt-desc">
          {PROMPT_DESCRIPTIONS[selectedPrompt]?.replace(/^[^-]+ - /, '') ?? ''}
        </p>

        <div className="ai-analysis-actions">
          <Button
            variant="primary"
            size="medium"
            onClick={handleRunAnalysis}
            disabled={isLoading}
            loading={isLoading}
            icon="🤖"
          >
            {isLoading ? '分析中...' : result ? '再分析' : `${formatMonthYear(reportMonth)}を分析`}
          </Button>

          {result && (
            <>
              <Button variant="outline" size="small" onClick={handleSaveToHistory}>
                履歴に保存
              </Button>
              <Button variant="ghost" size="small" onClick={clearResult}>
                クリア
              </Button>
            </>
          )}
        </div>

        {isCached && cacheTimestamp && (
          <p className="ai-analysis-cache-note">
            キャッシュされた結果を表示中（{new Date(cacheTimestamp).toLocaleString('ja-JP')}）
          </p>
        )}
      </div>

      <AIAnalysisResult
        content={result}
        isLoading={isLoading}
        error={error}
        onRetry={handleRunAnalysis}
      />
    </div>
  );
});

export { AIAnalysisSection };
