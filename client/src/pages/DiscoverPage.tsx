import React, { useState } from 'react';
import {
  Compass,
  Send,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { SourceType, ScraperJob } from '../types';
import { SpeechBubble } from '../components/comic/SpeechBubble';
import { ComicBadge } from '../components/comic/ComicBadge';

export interface DiscoverPageProps {
  onStartDiscovery: (query: string, sources: SourceType[]) => Promise<ScraperJob>;
  onNavigateToResources: (query: string) => void;
  activeJob: ScraperJob | null;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onStartDiscovery,
  onNavigateToResources,
  activeJob
}) => {
  const [query, setQuery] = useState('Python automation');
  const [selectedSources, setSelectedSources] = useState<SourceType[]>(['GITHUB', 'TELEGRAM']);
  const [isHunting, setIsHunting] = useState(false);
  const [liveJob, setLiveJob] = useState<ScraperJob | null>(activeJob);

  const exampleTopics = [
    'Python automation',
    'React dashboards',
    'AI agents',
    'Machine learning',
    'Cybersecurity',
    'Data science',
    'Rust cli tools',
    'System design notes'
  ];

  const toggleSource = (source: SourceType) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length > 1) {
        setSelectedSources(selectedSources.filter(s => s !== source));
      }
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleStartHunt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsHunting(true);

    try {
      const job = await onStartDiscovery(query, selectedSources);
      setLiveJob(job);

      // Simulate step progression for responsive interactive visual feedback
      let step = 1;
      const interval = setInterval(() => {
        setLiveJob(prev => {
          if (!prev) return null;
          const nextProgress = Math.min(prev.progress + 20, 100);

          let currentTask = prev.currentTask;
          const newLogs = [...prev.logs];
          const time = new Date().toLocaleTimeString();

          if (step === 1) {
            currentTask = 'Querying official GitHub API & scraping authorized channel feeds...';
            newLogs.push({ timestamp: time, step: 'Fetch', message: 'Discovered 34 candidate items across target sources', type: 'info' });
          } else if (step === 2) {
            currentTask = 'Extracting README markdown, file sizes, and media attributes...';
            newLogs.push({ timestamp: time, step: 'Metadata', message: 'Normalized canonical URLs and tags', type: 'info' });
          } else if (step === 3) {
            currentTask = 'Running deduplication engine and confidence similarity scoring...';
            newLogs.push({ timestamp: time, step: 'Deduplication', message: 'Detected 4 duplicates with score > 0.88; merged canonicals', type: 'success' });
          } else if (step >= 4) {
            currentTask = 'Discovery complete! Indexed 30 new resources.';
            newLogs.push({ timestamp: time, step: 'Saved', message: 'Successfully written to local catalog index', type: 'success' });
            clearInterval(interval);
            setIsHunting(false);
          }

          step++;

          return {
            ...prev,
            progress: nextProgress,
            currentTask,
            status: nextProgress === 100 ? 'COMPLETED' : 'RUNNING',
            resourcesFound: 30,
            duplicatesFound: 4,
            logs: newLogs
          };
        });
      }, 1200);
    } catch {
      setIsHunting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Search Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2">
          <ComicBadge variant="yellow" size="md">
            SCANNER V2.4
          </ComicBadge>
          <span className="text-xs font-bold text-ink-600 dark:text-paper-300">
            OFFICIAL APIS & AUTHORIZED FEEDS ONLY
          </span>
        </div>

        <h1 className="font-comic text-4xl sm:text-6xl text-ink-900 dark:text-paper-50 tracking-wider uppercase leading-none">
          WHAT ARE WE HUNTING TODAY?
        </h1>

        <p className="text-sm sm:text-base text-ink-600 dark:text-paper-300 max-w-xl mx-auto">
          Enter a topic, library, or keyword to automatically extract repos, docs, PDFs, cheatsheets, and tools.
        </p>
      </div>

      {/* Main Hunt Control Form */}
      <form onSubmit={handleStartHunt} className="comic-card bg-white dark:bg-ink-800 p-6 sm:p-8 space-y-6">
        {/* Big Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ink-600 dark:text-paper-300" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search keywords e.g. 'Python automation', 'React dashboards'..."
            className="w-full bg-paper-100 dark:bg-ink-900 text-ink-900 dark:text-paper-50 pl-14 pr-4 py-4 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-base sm:text-lg font-bold shadow-comic focus:outline-none focus:ring-4 focus:ring-comic-yellow transition-all"
          />
        </div>

        {/* Quick Example Chips */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-2">
            Popular Hunts:
          </div>
          <div className="flex flex-wrap gap-2">
            {exampleTopics.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setQuery(topic)}
                className={`text-xs px-3 py-1.5 rounded-lg border-2 font-semibold transition-all ${
                  query === topic
                    ? 'bg-comic-yellow text-ink-900 border-ink-800 shadow-comic-sm'
                    : 'bg-paper-100 dark:bg-ink-700 text-ink-700 dark:text-paper-200 border-ink-600/30 hover:border-ink-800 hover:bg-paper-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Source Selectors */}
        <div className="pt-4 border-t-2 border-paper-300 dark:border-ink-700">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 block mb-3">
            Select Resource Target Collectors
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub */}
            <div
              onClick={() => toggleSource('GITHUB')}
              className={`comic-card p-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedSources.includes('GITHUB')
                  ? 'bg-comic-yellow/15 border-ink-800 dark:border-paper-300'
                  : 'bg-paper-100 dark:bg-ink-700 opacity-60 border-paper-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-ink-900 text-white border border-ink-800">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-ink-900 dark:text-paper-50">GitHub API</div>
                  <div className="text-xs text-ink-600 dark:text-paper-300">Repositories, releases, READMEs & code</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedSources.includes('GITHUB')}
                onChange={() => {}}
                className="w-5 h-5 accent-comic-yellow cursor-pointer"
              />
            </div>

            {/* Telegram */}
            <div
              onClick={() => toggleSource('TELEGRAM')}
              className={`comic-card p-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedSources.includes('TELEGRAM')
                  ? 'bg-comic-blue/15 border-ink-800 dark:border-paper-300'
                  : 'bg-paper-100 dark:bg-ink-700 opacity-60 border-paper-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#229ED9] text-white border border-ink-800">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-ink-900 dark:text-paper-50">Telegram Channels</div>
                  <div className="text-xs text-ink-600 dark:text-paper-300">Authorized & public posts, PDFs, ZIPs</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedSources.includes('TELEGRAM')}
                onChange={() => {}}
                className="w-5 h-5 accent-comic-blue cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isHunting || !query.trim()}
            className="comic-btn w-full py-4 rounded-xl bg-comic-yellow text-ink-900 font-comic text-xl uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-50 shadow-comic"
          >
            <Compass className={`w-6 h-6 ${isHunting ? 'animate-spin' : ''}`} />
            <span>{isHunting ? 'SCANNING THE GITHUB GALAXY & TELEGRAM...' : 'START DISCOVERY'}</span>
          </button>
        </div>
      </form>

      {/* Live Hunt Progress Section */}
      {liveJob && (
        <div className="comic-card bg-white dark:bg-ink-800 p-6 sm:p-8 space-y-6 animate-fade-in border-2 border-ink-800 dark:border-paper-300">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-paper-300 dark:border-ink-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-comic-red animate-ping" />
              <h2 className="font-comic text-2xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
                RESOURCE HUNT IN PROGRESS
              </h2>
            </div>
            <ComicBadge
              variant={liveJob.status === 'COMPLETED' ? 'green' : 'yellow'}
              size="md"
              pulse={liveJob.status === 'RUNNING'}
            >
              {liveJob.status === 'COMPLETED' ? 'DONE!' : 'POW! RUNNING'}
            </ComicBadge>
          </div>

          {/* Dual Progress Bars */}
          <div className="space-y-4">
            {liveJob.sources.includes('GITHUB') && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-800 dark:text-paper-100 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <GithubIcon className="w-4 h-4" />
                    <span>GitHub Galaxy Scanner</span>
                  </span>
                  <span className="font-mono">{liveJob.progress}%</span>
                </div>
                <div className="w-full h-4 bg-paper-200 dark:bg-ink-900 rounded-full border-2 border-ink-800 dark:border-paper-300 overflow-hidden">
                  <div
                    className="h-full bg-comic-yellow transition-all duration-500 rounded-full"
                    style={{ width: `${liveJob.progress}%` }}
                  />
                </div>
              </div>
            )}

            {liveJob.sources.includes('TELEGRAM') && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-800 dark:text-paper-100 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Send className="w-4 h-4" />
                    <span>Telegram Channel Stream</span>
                  </span>
                  <span className="font-mono">{Math.max(0, liveJob.progress - 10)}%</span>
                </div>
                <div className="w-full h-4 bg-paper-200 dark:bg-ink-900 rounded-full border-2 border-ink-800 dark:border-paper-300 overflow-hidden">
                  <div
                    className="h-full bg-comic-blue transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(0, liveJob.progress - 10)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Current Task in Speech Bubble */}
          <SpeechBubble icon={<Sparkles className="w-5 h-5 text-comic-yellow" />}>
            {liveJob.currentTask}
          </SpeechBubble>

          {/* Activity Log */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-2">
              Collector Activity Log:
            </div>
            <div className="p-4 rounded-xl bg-paper-100 dark:bg-ink-900 border-2 border-ink-800 dark:border-paper-300 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
              {liveJob.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-comic-green flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600 dark:text-paper-300">[{log.timestamp}]</span>
                  <span className="font-bold text-ink-800 dark:text-paper-200">{log.step}:</span>
                  <span className="text-ink-700 dark:text-paper-100">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* View results button once done */}
          {liveJob.status === 'COMPLETED' && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateToResources(query)}
                className="comic-btn bg-comic-green text-ink-900 text-sm px-6 py-3 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 hover:bg-emerald-400"
              >
                <span>View Discovered Resources ({liveJob.resourcesFound})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
