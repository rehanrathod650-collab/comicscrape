import React from 'react';
import { Filter, RotateCcw, Star } from 'lucide-react';
import { DiscoveryFilters, SourceType, ResourceType } from '../../types';

export interface FilterPanelProps {
  filters: DiscoveryFilters;
  onChange: (filters: DiscoveryFilters) => void;
  onReset: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  className = ''
}) => {
  const sourcesList: { label: string; value: SourceType }[] = [
    { label: 'GitHub', value: 'GITHUB' },
    { label: 'Telegram', value: 'TELEGRAM' }
  ];

  const typesList: { label: string; value: ResourceType }[] = [
    { label: 'Repository', value: 'REPOSITORY' },
    { label: 'PDF Document', value: 'PDF' },
    { label: 'Code Snippets', value: 'CODE' },
    { label: 'Documentation', value: 'DOCUMENTATION' },
    { label: 'Tutorial / Guide', value: 'TUTORIAL' },
    { label: 'E-Book', value: 'EBOOK' },
    { label: 'Tools / CLI', value: 'TOOL' },
    { label: 'Dataset', value: 'DATASET' },
    { label: 'Template', value: 'TEMPLATE' },
    { label: 'ZIP Archive', value: 'ZIP' }
  ];

  const languagesList = [
    'Python',
    'TypeScript',
    'JavaScript',
    'Rust',
    'Go',
    'Jupyter Notebook',
    'Markdown'
  ];

  const fileTypesList = ['pdf', 'zip', 'epub', 'go', 'py', 'json', 'txt'];

  const toggleSource = (source: SourceType) => {
    const current = filters.sources || [];
    const next = current.includes(source)
      ? current.filter(s => s !== source)
      : [...current, source];
    onChange({ ...filters, sources: next, page: 1 });
  };

  const toggleType = (type: ResourceType) => {
    const current = filters.resourceTypes || [];
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange({ ...filters, resourceTypes: next, page: 1 });
  };

  const toggleLanguage = (lang: string) => {
    const current = filters.languages || [];
    const next = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang];
    onChange({ ...filters, languages: next, page: 1 });
  };

  const toggleFileType = (ft: string) => {
    const current = filters.fileTypes || [];
    const next = current.includes(ft)
      ? current.filter(f => f !== ft)
      : [...current, ft];
    onChange({ ...filters, fileTypes: next, page: 1 });
  };

  return (
    <div className={`comic-card bg-white dark:bg-ink-800 p-5 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-paper-300 dark:border-ink-700">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-comic-yellow" />
          <h2 className="font-comic text-base tracking-wider text-ink-900 dark:text-paper-50 uppercase">
            Resource Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs flex items-center gap-1 font-semibold text-ink-600 hover:text-comic-red dark:text-paper-300 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Source Selection */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-2.5">
          Source Platform
        </label>
        <div className="space-y-2">
          {sourcesList.map(s => {
            const checked = (filters.sources || []).includes(s.value);
            return (
              <label
                key={s.value}
                className="flex items-center gap-2.5 text-xs font-bold text-ink-800 dark:text-paper-100 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSource(s.value)}
                  className="w-4 h-4 rounded border-2 border-ink-800 dark:border-paper-300 text-comic-yellow focus:ring-comic-yellow cursor-pointer"
                />
                <span>{s.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Resource Types */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-2.5">
          Resource Type
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {typesList.map(t => {
            const checked = (filters.resourceTypes || []).includes(t.value);
            return (
              <label
                key={t.value}
                className="flex items-center gap-2.5 text-xs font-medium text-ink-700 dark:text-paper-200 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleType(t.value)}
                  className="w-4 h-4 rounded border-2 border-ink-800 dark:border-paper-300 text-comic-yellow focus:ring-comic-yellow cursor-pointer"
                />
                <span>{t.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-2.5">
          Programming Language
        </label>
        <div className="flex flex-wrap gap-1.5">
          {languagesList.map(lang => {
            const active = (filters.languages || []).includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`text-[11px] font-bold px-2 py-1 rounded-md border-2 transition-all ${
                  active
                    ? 'bg-comic-blue text-ink-900 border-ink-800 shadow-comic-sm'
                    : 'bg-paper-100 dark:bg-ink-700 text-ink-700 dark:text-paper-200 border-ink-600/30 hover:border-ink-800'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Popularity (Stars) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Min Stars</span>
          </label>
          <span className="text-xs font-mono font-bold text-ink-900 dark:text-paper-100">
            {filters.minStars ? `${filters.minStars}+` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="500"
          value={filters.minStars || 0}
          onChange={e => onChange({ ...filters, minStars: Number(e.target.value), page: 1 })}
          className="w-full accent-comic-yellow cursor-pointer"
        />
      </div>

      {/* File Extension Types */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-2.5">
          File Format
        </label>
        <div className="flex flex-wrap gap-1.5">
          {fileTypesList.map(ft => {
            const active = (filters.fileTypes || []).includes(ft);
            return (
              <button
                key={ft}
                type="button"
                onClick={() => toggleFileType(ft)}
                className={`text-[11px] font-mono uppercase font-bold px-2 py-0.5 rounded border transition-all ${
                  active
                    ? 'bg-comic-yellow text-ink-900 border-ink-800 shadow-comic-sm'
                    : 'bg-paper-100 dark:bg-ink-700 text-ink-700 dark:text-paper-300 border-paper-300 dark:border-ink-600'
                }`}
              >
                .{ft}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
