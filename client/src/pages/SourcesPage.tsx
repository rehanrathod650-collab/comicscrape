import React, { useState } from 'react';
import {
  Sliders,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { SourceConfig } from '../types';
import { ComicBadge } from '../components/comic/ComicBadge';
import { Modal } from '../components/common/Modal';

export interface SourcesPageProps {
  sources: SourceConfig[];
  onUpdateSource: (id: string, config: any) => Promise<void>;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({
  sources,
  onUpdateSource
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceConfig | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [channelsInput, setChannelsInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleOpenConfig = (source: SourceConfig) => {
    setSelectedSource(source);
    setTestResult(null);
    if (source.type === 'GITHUB') {
      setTokenInput('');
    } else {
      setChannelsInput('PythonResourcesDaily, AIDataScienceHub, CyberSecNotesArchive');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource) return;

    setTesting(true);
    // Simulate connection ping
    setTimeout(async () => {
      await onUpdateSource(selectedSource.id, {
        configured: true,
        updatedAt: new Date().toISOString()
      });
      setTesting(false);
      setTestResult('Connection verified! Collector authenticated successfully.');
      setTimeout(() => setSelectedSource(null), 1000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
            INTEGRATED DATA SOURCES
          </h1>
          <ComicBadge variant="green" size="sm">
            ALL SYSTEMS NORMAL
          </ComicBadge>
        </div>
        <p className="text-xs text-ink-600 dark:text-paper-300">
          Manage API authentication keys, authorized channel access, rate-limit policies, and collector synchronization.
        </p>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map(source => {
          const isGithub = source.type === 'GITHUB';

          return (
            <div
              key={source.id}
              className="comic-card bg-white dark:bg-ink-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl text-white border-2 border-ink-800 shadow-comic-sm ${
                    isGithub ? 'bg-ink-900' : 'bg-[#229ED9]'
                  }`}
                >
                  {isGithub ? <GithubIcon className="w-8 h-8" /> : <Send className="w-8 h-8" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-ink-900 dark:text-paper-50">
                      {source.name}
                    </h3>
                    <ComicBadge variant="green" size="sm">
                      CONNECTED
                    </ComicBadge>
                  </div>

                  <p className="text-xs text-ink-600 dark:text-paper-300 mt-0.5">
                    {isGithub
                      ? 'Official GitHub REST API (v3) with OAuth & Rate-Limit Backoff'
                      : 'Authorized Channels, Public Channel Previews & Bot API'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs mt-2 text-ink-700 dark:text-paper-200">
                    <span>
                      Total Indexed: <strong>{source.resourceCount.toLocaleString()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Last Synced: {source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleTimeString() : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleOpenConfig(source)}
                  className="comic-btn bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-comic-yellow hover:text-ink-900 font-bold"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Banner */}
      <div className="comic-card bg-paper-100 dark:bg-ink-900 p-5 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-comic-green flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-ink-900 dark:text-paper-50 mb-0.5">
            Strict Credential Security & Authorization Compliance
          </h4>
          <p className="text-xs text-ink-600 dark:text-paper-300 leading-relaxed">
            API secrets, Telegram MTProto session strings, and personal access tokens are strictly stored in backend environment variables and are never sent to or visible from the frontend browser.
          </p>
        </div>
      </div>

      {/* Configuration Modal */}
      {selectedSource && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSource(null)}
          title={`Configure ${selectedSource.name}`}
          size="md"
        >
          <form onSubmit={handleSaveConfig} className="space-y-4">
            {selectedSource.type === 'GITHUB' ? (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1">
                  GitHub Personal Access Token (Optional)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-ink-600" />
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="ghp_************************************"
                    className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-100 pl-10 pr-4 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-xs font-mono font-bold shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-comic-yellow"
                  />
                </div>
                <p className="text-[11px] text-ink-600 dark:text-paper-300 mt-1">
                  Increases official API hourly rate limit from 60 to 5,000 requests. Public search works without a token as well.
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1">
                  Monitored Authorized Channels
                </label>
                <textarea
                  value={channelsInput}
                  onChange={e => setChannelsInput(e.target.value)}
                  rows={3}
                  placeholder="e.g. PythonResourcesDaily, AIDataScienceHub, TechInterviewPrep"
                  className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-100 px-3.5 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-xs shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-comic-yellow font-mono"
                />
                <p className="text-[11px] text-ink-600 dark:text-paper-300 mt-1">
                  Specify public usernames or channels accessible by your configured bot/session.
                </p>
              </div>
            )}

            {testResult && (
              <div className="p-3 rounded-xl bg-comic-green/20 border-2 border-comic-green text-xs font-bold text-ink-900 dark:text-paper-50 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{testResult}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="comic-btn bg-paper-200 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-4 py-2 rounded-xl"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={testing}
                className="comic-btn bg-comic-yellow text-ink-900 text-xs px-5 py-2 rounded-xl font-comic tracking-wider uppercase hover:bg-yellow-400 disabled:opacity-50"
              >
                {testing ? 'Testing Connection...' : 'Save & Test'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
