import { useState } from 'react';
import { useAIConfig } from '../../../hooks/useAIConfig';
import { AIProvider } from '../../../types/ai';
import { AI_PROVIDERS, getProviderMeta } from '../../../constants/ai';
import { testConnection } from '../../../services/aiService';
import { Button } from '../../ui/base/Button';
import './AISettings.css';

export function AISettings() {
  const { config, saveConfig, clearConfig } = useAIConfig();

  const [provider, setProvider] = useState<AIProvider>(config?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState(config?.apiKey ?? '');
  const [model, setModel] = useState(config?.model ?? getProviderMeta('openai').defaultModel);
  const [customEndpoint, setCustomEndpoint] = useState(config?.customEndpoint ?? '');
  const [useCustomModel, setUseCustomModel] = useState(() => {
    if (!config) return false;
    const meta = getProviderMeta(config.provider);
    if (meta.models.length === 0) return false;
    return !meta.models.some((m) => m.id === config.model);
  });
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  const providerMeta = getProviderMeta(provider);
  const isOpenAICompatible = provider === 'openai-compatible';
  const hasPresetModels = providerMeta.models.length > 0;

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const meta = getProviderMeta(newProvider);
    if (meta.models.length > 0) {
      setModel(meta.defaultModel);
      setUseCustomModel(false);
    } else {
      setModel('');
      setUseCustomModel(false);
    }
    setTestStatus('idle');
  };

  const handleCustomModelToggle = (checked: boolean) => {
    setUseCustomModel(checked);
    if (!checked && hasPresetModels) {
      setModel(providerMeta.defaultModel);
    } else if (checked) {
      setModel('');
    }
    setTestStatus('idle');
  };

  const handleSave = () => {
    saveConfig({
      provider,
      apiKey,
      model,
      ...(isOpenAICompatible ? { customEndpoint } : {}),
    });
    setTestStatus('idle');
  };

  const handleClear = () => {
    clearConfig();
    setApiKey('');
    setProvider('openai');
    setModel(getProviderMeta('openai').defaultModel);
    setCustomEndpoint('');
    setUseCustomModel(false);
    setShowKey(false);
    setTestStatus('idle');
  };

  const handleTest = async () => {
    if (!apiKey) return;
    setTestStatus('testing');
    setTestError('');
    try {
      await testConnection({
        provider,
        apiKey,
        model,
        ...(isOpenAICompatible ? { customEndpoint } : {}),
      });
      setTestStatus('success');
    } catch (err) {
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : '接続に失敗しました');
    }
  };

  const canSave = apiKey && model && (!isOpenAICompatible || customEndpoint);

  return (
    <div className="ai-settings">
      <div className="ai-settings__section">
        <h3 className="ai-settings__section-title">プロバイダー</h3>
        <div className="ai-settings__providers">
          {AI_PROVIDERS.map((p) => (
            <label key={p.id} className={`ai-settings__provider ${provider === p.id ? 'active' : ''}`}>
              <input
                type="radio"
                name="ai-provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => handleProviderChange(p.id)}
              />
              <span className="ai-settings__provider-name">{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      {isOpenAICompatible && (
        <div className="ai-settings__section">
          <h3 className="ai-settings__section-title">エンドポイントURL</h3>
          <input
            type="text"
            value={customEndpoint}
            onChange={(e) => { setCustomEndpoint(e.target.value); setTestStatus('idle'); }}
            placeholder="https://openrouter.ai/api/v1"
            className="ai-settings__input"
          />
          <p className="ai-settings__hint">
            OpenAI互換の /v1/chat/completions エンドポイントを持つサービスのベースURLを入力してください。
          </p>
        </div>
      )}

      <div className="ai-settings__section">
        <h3 className="ai-settings__section-title">APIキー</h3>
        <div className="ai-settings__key-input">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTestStatus('idle'); }}
            placeholder={`${providerMeta.name} APIキーを入力`}
            className="ai-settings__input"
          />
          <Button
            variant="ghost"
            size="small"
            onClick={() => setShowKey(!showKey)}
            className="ai-settings__toggle-key"
          >
            {showKey ? '隠す' : '表示'}
          </Button>
        </div>
      </div>

      <div className="ai-settings__section">
        <h3 className="ai-settings__section-title">モデル</h3>
        {hasPresetModels && (
          <label className="ai-settings__custom-model-toggle">
            <input
              type="checkbox"
              checked={useCustomModel}
              onChange={(e) => handleCustomModelToggle(e.target.checked)}
            />
            <span>その他（自由入力）</span>
          </label>
        )}
        {hasPresetModels && !useCustomModel ? (
          <select
            value={model}
            onChange={(e) => { setModel(e.target.value); setTestStatus('idle'); }}
            className="ai-settings__select"
          >
            {providerMeta.models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={model}
            onChange={(e) => { setModel(e.target.value); setTestStatus('idle'); }}
            placeholder="モデルIDを入力（例: gpt-4o, claude-sonnet-4-20250514）"
            className="ai-settings__input"
          />
        )}
      </div>

      <div className="ai-settings__actions">
        <Button
          variant="outline"
          size="medium"
          onClick={handleTest}
          disabled={!canSave || testStatus === 'testing'}
        >
          {testStatus === 'testing' ? '接続テスト中...' : '接続テスト'}
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSave}
          disabled={!canSave}
        >
          保存
        </Button>
        {config && (
          <Button
            variant="ghost"
            size="medium"
            onClick={handleClear}
          >
            設定を削除
          </Button>
        )}
      </div>

      {testStatus === 'success' && (
        <div className="ai-settings__status ai-settings__status--success">
          接続成功
        </div>
      )}
      {testStatus === 'error' && (
        <div className="ai-settings__status ai-settings__status--error">
          {testError}
        </div>
      )}

      <div className="ai-settings__notice">
        APIキーはこのブラウザのlocalStorageにのみ保存されます。外部サーバーには送信されません。
      </div>
    </div>
  );
}
