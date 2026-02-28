import { useState, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import { aiAnalysisHistoryService, type AIAnalysisRecord } from '../../../services/aiAnalysisHistory';
import { AIPromptTemplate } from '../../../types/statistics';
import { useUI } from '../../../contexts/UIContext';
import { Button } from '../../ui/base/Button';
import './AIAnalysisHistory.css';

const PROMPT_LABELS: Record<AIPromptTemplate, string> = {
  basic: '基本分析',
  detailed: '詳細分析',
  stock: '銘柄別分析',
  monthly: '月次分析',
  score: 'スコア評価',
};

export function AIAnalysisHistory() {
  const { showToast } = useUI();
  const [records, setRecords] = useState<AIAnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await aiAnalysisHistoryService.getAll();
      setRecords(data);
    } catch {
      showToast('AI分析履歴の読み込みに失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await aiAnalysisHistoryService.deleteById(id);
        setRecords((prev) => prev.filter((r) => r.id !== id));
        showToast('削除しました', 'success');
      } catch {
        showToast('削除に失敗しました', 'error');
      }
    },
    [showToast],
  );

  const handleClearAll = useCallback(async () => {
    try {
      await aiAnalysisHistoryService.clearAll();
      setRecords([]);
      showToast('全履歴を削除しました', 'success');
    } catch {
      showToast('削除に失敗しました', 'error');
    }
  }, [showToast]);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('コピーしました', 'success');
      } catch {
        showToast('コピーに失敗しました', 'error');
      }
    },
    [showToast],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (isLoading) {
    return (
      <div className="ai-history">
        <h2>AI分析履歴</h2>
        <p className="ai-history__loading">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="ai-history">
      <h2>AI分析履歴</h2>

      {records.length === 0 ? (
        <div className="ai-history__empty">
          <p>保存されたAI分析結果はありません。</p>
          <p className="ai-history__empty-hint">
            月次レポートのAI分析セクションで「履歴に保存」をクリックすると、ここに保存されます。
          </p>
        </div>
      ) : (
        <>
          <div className="ai-history__actions">
            <span className="ai-history__count">{records.length}件の分析結果</span>
            <Button variant="danger" size="small" onClick={handleClearAll}>
              全削除
            </Button>
          </div>

          <div className="ai-history__list">
            {records.map((record) => {
              const isExpanded = expandedId === record.id;
              const createdAt =
                record.createdAt instanceof Date
                  ? record.createdAt
                  : new Date(record.createdAt);

              return (
                <div key={record.id} className="ai-history__item">
                  <div
                    className="ai-history__item-header"
                    onClick={() => toggleExpand(record.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggleExpand(record.id);
                    }}
                  >
                    <div className="ai-history__item-meta">
                      <span className="ai-history__item-month">{record.month}</span>
                      <span className="ai-history__item-prompt-type">
                        {PROMPT_LABELS[record.promptType] ?? record.promptType}
                      </span>
                    </div>
                    <div className="ai-history__item-date">
                      {createdAt.toLocaleString('ja-JP')}
                    </div>
                    <span className={`ai-history__expand-icon ${isExpanded ? 'ai-history__expand-icon--open' : ''}`}>
                      &#9662;
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="ai-history__item-body">
                      <div className="ai-history__item-toolbar">
                        <Button variant="ghost" size="small" onClick={() => handleCopy(record.result)}>
                          コピー
                        </Button>
                        <Button variant="danger" size="small" onClick={() => handleDelete(record.id)}>
                          削除
                        </Button>
                      </div>
                      <div className="ai-history__item-content">
                        <Markdown>{record.result}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
