import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  Bell,
  Clock,
  Play,
  Trash2,
  Send
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { SavedSearch, SourceType } from '../types';
import { ComicBadge } from '../components/comic/ComicBadge';
import { SourceBadge } from '../components/common/SourceBadge';
import { Modal } from '../components/common/Modal';

export interface SavedSearchesPageProps {
  searches: SavedSearch[];
  onCreateSavedSearch: (search: Partial<SavedSearch>) => Promise<void>;
  onTriggerSearch: (query: string) => void;
}

export const SavedSearchesPage: React.FC<SavedSearchesPageProps> = ({
  searches,
  onCreateSavedSearch,
  onTriggerSearch
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sources, setSources] = useState<SourceType[]>(['GITHUB', 'TELEGRAM']);
  const [frequency, setFrequency] = useState<'HOURLY' | 'DAILY' | 'WEEKLY'>('DAILY');
  const [notify, setNotify] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await onCreateSavedSearch({ query, sources, frequency, notifyOnNew: notify });
    setQuery('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
              AUTOMATED SAVED SEARCHES
            </h1>
            <ComicBadge variant="blue" size="sm">
              MONITORING
            </ComicBadge>
          </div>
          <p className="text-xs text-ink-600 dark:text-paper-300">
            Configure automated queries that continuously scan GitHub and Telegram channels for fresh content.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="comic-btn bg-comic-yellow text-ink-900 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" />
          <span>+ Save New Search</span>
        </button>
      </div>

      {/* Saved Searches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {searches.map(ss => (
          <div
            key={ss.id}
            className="comic-card bg-white dark:bg-ink-800 p-5 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <ComicBadge variant="yellow" size="sm">
                  {ss.frequency} SCAN
                </ComicBadge>
                {ss.notifyOnNew && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Alerts On</span>
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-ink-900 dark:text-paper-50 mb-2">
                "{ss.query}"
              </h3>

              <div className="flex items-center gap-2 mb-3">
                {ss.sources.map(s => (
                  <SourceBadge key={s} source={s} size="sm" />
                ))}
              </div>

              <div className="text-xs text-ink-600 dark:text-paper-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last executed: {ss.lastRunAt ? new Date(ss.lastRunAt).toLocaleDateString() : 'Pending trigger'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-paper-200 dark:border-ink-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onTriggerSearch(ss.query)}
                className="comic-btn bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-comic-yellow hover:text-ink-900 font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Search Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Automated Search Alert"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1">
              Search Query
            </label>
            <input
              type="text"
              required
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Python AI agents"
              className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-100 px-3.5 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-sm font-bold shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-comic-yellow"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-1.5">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as any)}
              className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-100 px-3.5 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-xs font-bold shadow-comic-sm focus:outline-none focus:ring-2 focus:ring-comic-yellow cursor-pointer"
            >
              <option value="HOURLY">Hourly Check</option>
              <option value="DAILY">Daily Check</option>
              <option value="WEEKLY">Weekly Digest</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-bold text-ink-800 dark:text-paper-100 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={notify}
              onChange={e => setNotify(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-ink-800 text-comic-yellow cursor-pointer"
            />
            <span>Notify me immediately when new matching resources are found</span>
          </label>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="comic-btn bg-paper-200 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="comic-btn bg-comic-yellow text-ink-900 text-xs px-5 py-2 rounded-xl font-comic tracking-wider uppercase hover:bg-yellow-400"
            >
              Save Search
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
