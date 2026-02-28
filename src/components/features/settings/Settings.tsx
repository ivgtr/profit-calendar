import { useState } from 'react';
import { Button } from '../../ui/base/Button';
import { ThemeSettings } from './ThemeSettings';
import { AISettings } from './AISettings';
import './Settings.css';

type SettingsTab = 'theme' | 'ai';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');

  return (
    <div className="settings">
      <h2 className="settings__title">設定</h2>
      <div className="settings__tabs">
        <Button
          className={`settings__tab ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
          variant={activeTab === 'theme' ? 'primary' : 'secondary'}
          size="medium"
        >
          テーマ
        </Button>
        <Button
          className={`settings__tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          variant={activeTab === 'ai' ? 'primary' : 'secondary'}
          size="medium"
        >
          AI連携
        </Button>
      </div>
      <div className="settings__content">
        {activeTab === 'theme' && <ThemeSettings />}
        {activeTab === 'ai' && <AISettings />}
      </div>
    </div>
  );
}
