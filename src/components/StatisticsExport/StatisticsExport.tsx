import React, { useState, useCallback } from 'react';
import { StatisticsService } from '../../services/statisticsService';
import { ExportOptions, AIPromptTemplate, StatisticsExport as StatisticsData } from '../../types/statistics';
import { AI_PROMPTS, PROMPT_DESCRIPTIONS } from '../../constants/aiPrompts';
import { useUI } from '../../contexts/UIContext';
import './StatisticsExport.css';

export const StatisticsExport: React.FC = () => {
  const { showToast } = useUI();
  const statsService = StatisticsService.getInstance();

  const [dateRange, setDateRange] = useState<ExportOptions['dateRange']>('all');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [exportOptions, setExportOptions] = useState<Omit<ExportOptions, 'dateRange' | 'customRange'>>({
    includeAdvancedMetrics: true,
    includeStockAnalysis: true,
    includeTrendAnalysis: true,
    includeMonthlyBreakdown: true,
    stockAnalysisDepth: 'top10',
    maskStockNames: false,
    useRelativeValues: false
  });

  const [selectedPrompt, setSelectedPrompt] = useState<AIPromptTemplate>('basic');
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState<StatisticsData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const getExportOptions = useCallback((): ExportOptions => {
    return {
      ...exportOptions,
      dateRange,
      customRange: dateRange === 'custom' ? {
        start: new Date(customRange.start),
        end: new Date(customRange.end)
      } : undefined
    };
  }, [dateRange, customRange, exportOptions]);

  const handleGeneratePreview = useCallback(async () => {
    setIsExporting(true);
    try {
      const options = getExportOptions();
      const stats = await statsService.generateStatistics(options);
      setPreviewData(stats);
      setShowPreview(true);
      showToast('プレビューを生成しました', 'success');
    } catch (error) {
      console.error('Preview generation failed:', error);
      showToast('プレビュー生成に失敗しました', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [getExportOptions, statsService, showToast]);

  const handleDownloadJSON = useCallback(async () => {
    setIsExporting(true);
    try {
      const options = getExportOptions();
      const blob = await statsService.exportToJSON(options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.href = url;
      a.download = `profit-calendar-analysis_${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast('統計データファイルをダウンロードしました', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('ダウンロードに失敗しました', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [getExportOptions, statsService, showToast]);

  const handleCopyPrompt = useCallback(async () => {
    try {
      const promptText = AI_PROMPTS[selectedPrompt];
      await navigator.clipboard.writeText(promptText);
      showToast('分析プロンプトをコピーしました', 'success');
    } catch (error) {
      console.error('Copy prompt failed:', error);
      showToast('プロンプトのコピーに失敗しました', 'error');
    }
  }, [selectedPrompt, showToast]);

  return (
    <div className="statistics-export">
      <h2>🤖 AI分析用データエクスポート</h2>
      
      <div className="usage-explanation">
        <h3>📋 使用方法</h3>
        <p className="usage-simple">取引データをAI分析するための<strong>JSONファイル</strong>と<strong>分析プロンプト</strong>をダウンロード・コピーできます。ChatGPT、Claude等のAIツールにアップロードしてご活用ください。</p>
      </div>

      <div className="export-section">
        <h3>📅 分析期間</h3>
        <div className="date-range-options">
          <label>
            <input
              type="radio"
              value="all"
              checked={dateRange === 'all'}
              onChange={(e) => setDateRange(e.target.value as ExportOptions['dateRange'])}
            />
            全期間
          </label>
          <label>
            <input
              type="radio"
              value="year"
              checked={dateRange === 'year'}
              onChange={(e) => setDateRange(e.target.value as ExportOptions['dateRange'])}
            />
            今年
          </label>
          <label>
            <input
              type="radio"
              value="quarter"
              checked={dateRange === 'quarter'}
              onChange={(e) => setDateRange(e.target.value as ExportOptions['dateRange'])}
            />
            今四半期
          </label>
          <label>
            <input
              type="radio"
              value="month"
              checked={dateRange === 'month'}
              onChange={(e) => setDateRange(e.target.value as ExportOptions['dateRange'])}
            />
            今月
          </label>
          <label>
            <input
              type="radio"
              value="custom"
              checked={dateRange === 'custom'}
              onChange={(e) => setDateRange(e.target.value as ExportOptions['dateRange'])}
            />
            カスタム期間
          </label>
        </div>
        
        {dateRange === 'custom' && (
          <div className="custom-range">
            <div className="date-input-group">
              <label>
                開始日:
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </label>
              <label>
                終了日:
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="export-section">
        <h3>📊 データ内容設定</h3>
        <div className="settings-grid">
          <div className="setting-group">
            <h4>含めるデータ</h4>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAdvancedMetrics}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeAdvancedMetrics: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
                高度分析指標
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStockAnalysis}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeStockAnalysis: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
                銘柄パフォーマンス
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTrendAnalysis}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeTrendAnalysis: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
                トレンド・リスク分析
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMonthlyBreakdown}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeMonthlyBreakdown: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
                月次詳細データ
              </label>
            </div>
          </div>
          
          <div className="setting-group">
            <h4>プライバシー</h4>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={exportOptions.maskStockNames}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, maskStockNames: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
                銘柄名匿名化
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={exportOptions.useRelativeValues}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, useRelativeValues: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
                金額を相対化
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="step-section">
        <h3>Step 1: 統計データファイルの生成</h3>
        <div className="step-actions">
          <button
            onClick={handleGeneratePreview}
            disabled={isExporting}
            className="btn btn-preview"
          >
            <span className="btn-icon">👁️</span>
            {isExporting ? '生成中...' : 'データを確認'}
          </button>
          <button
            onClick={handleDownloadJSON}
            disabled={isExporting}
            className="btn btn-download"
          >
            <span className="btn-icon">💾</span>
            {isExporting ? 'ダウンロード中...' : 'JSONファイルをダウンロード'}
          </button>
        </div>
        
        {showPreview && previewData && (
          <div className="preview-section">
            <h4>データプレビュー</h4>
            <div className="preview-stats">
              <p><strong>対象期間:</strong> {previewData.metadata.dataRange.start} ～ {previewData.metadata.dataRange.end}</p>
              <p><strong>取引件数:</strong> {previewData.metadata.totalRecords.toLocaleString()}件</p>
              <p><strong>純損益:</strong> {previewData.performanceOverview.netProfit?.toLocaleString()}円</p>
              <p><strong>勝率:</strong> {((previewData.performanceOverview.winRate || 0) * 100).toFixed(1)}%</p>
              <p><strong>ファイルサイズ:</strong> 約{Math.round(JSON.stringify(previewData).length / 1024)}KB</p>
            </div>
          </div>
        )}
      </div>

      <div className="step-section">
        <h3>Step 2: 分析プロンプトの取得</h3>
        
        <div className="prompt-cards">
          {Object.entries(PROMPT_DESCRIPTIONS).map(([key, description]) => (
            <div
              key={key}
              className={`prompt-card ${selectedPrompt === key ? 'selected' : ''}`}
              onClick={() => setSelectedPrompt(key as AIPromptTemplate)}
            >
              <div className="prompt-card-header">
                <div className="prompt-icon">
                  {key === 'basic' ? '📊' : 
                   key === 'detailed' ? '🔬' : 
                   key === 'stock' ? '📈' : '🏆'}
                </div>
                <h4>{key === 'basic' ? '基本分析' : 
                     key === 'detailed' ? '詳細分析' : 
                     key === 'stock' ? '銘柄別分析' : 'スコア評価'}</h4>
              </div>
              <p className="prompt-description">{description.replace(/^[^-]+ - /, '')}</p>
            </div>
          ))}
        </div>
        
        <div className="prompt-action">
          <button
            onClick={handleCopyPrompt}
            className="btn btn-copy-prompt"
          >
            <span className="btn-icon">📋</span>
            分析プロンプトをコピー
          </button>
        </div>
      </div>

      <div className="step-section step-final">
        <h3>Step 3: AI分析の実行</h3>
        <div className="ai-steps">
          <div className="ai-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p><strong>AIツール</strong>を開く<br/>
              <small>ChatGPT、Claude、Gemini等</small></p>
            </div>
          </div>
          <div className="ai-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p><strong>JSONファイル</strong>をアップロード</p>
            </div>
          </div>
          <div className="ai-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p><strong>プロンプト</strong>を送信<br/>
              <small>分析結果が返されます</small></p>
            </div>
          </div>
        </div>
        
        <div className="success-note">
          <span className="success-icon">✨</span>
          <p>AIが詳細な投資分析結果を生成します</p>
        </div>
      </div>
    </div>
  );
};