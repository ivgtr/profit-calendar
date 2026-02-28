import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import { Button } from '../../ui/base/Button';
import './AIAnalysisResult.css';

interface AIAnalysisResultProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function AIAnalysisResult({ content, isLoading, error, onRetry }: AIAnalysisResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  if (isLoading) {
    return (
      <div className="ai-result ai-result--loading">
        <div className="ai-result__spinner" />
        <p className="ai-result__loading-text">AI分析を実行中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-result ai-result--error">
        <p className="ai-result__error-text">{error}</p>
        {onRetry && (
          <Button variant="outline" size="small" onClick={onRetry}>
            再試行
          </Button>
        )}
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="ai-result">
      <div className="ai-result__header">
        <h4 className="ai-result__title">分析結果</h4>
        <Button variant="ghost" size="small" onClick={handleCopy}>
          {copied ? 'コピー済み' : 'コピー'}
        </Button>
      </div>
      <div className="ai-result__content">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
