import React from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Layers,
  CopyCheck,
  CheckCircle2
} from 'lucide-react';
import { ComicBadge } from '../components/comic/ComicBadge';
import { Resource } from '../types';

export interface AnalyticsPageProps {
  resources: Resource[];
  analyticsData?: any;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  resources,
  analyticsData
}) => {
  const githubCount = resources.filter(r => r.sourceType === 'GITHUB').length;
  const telegramCount = resources.filter(r => r.sourceType === 'TELEGRAM').length;
  const total = resources.length || 1;

  const githubPct = Math.round((githubCount / total) * 100);
  const telegramPct = Math.round((telegramCount / total) * 100);

  // Group by resource types
  const typeCounts: Record<string, number> = {};
  resources.forEach(r => {
    typeCounts[r.resourceType] = (typeCounts[r.resourceType] || 0) + 1;
  });

  const sortedTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const weeklyDiscovery = [
    { day: 'Mon', count: 42 },
    { day: 'Tue', count: 68 },
    { day: 'Wed', count: 95 },
    { day: 'Thu', count: 54 },
    { day: 'Fri', count: 120 },
    { day: 'Sat', count: 88 },
    { day: 'Sun', count: 142 }
  ];
  const maxDay = Math.max(...weeklyDiscovery.map(d => d.count));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
            DISCOVERY ANALYTICS & INSIGHTS
          </h1>
          <ComicBadge variant="yellow" size="sm">
            REALTIME
          </ComicBadge>
        </div>
        <p className="text-xs text-ink-600 dark:text-paper-300">
          Telemetry on ingestion throughput, source distribution, deduplication efficiency, and taxonomy breakdown.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="comic-card bg-white dark:bg-ink-800 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-1">
            Discovery Success Rate
          </div>
          <div className="font-comic text-3xl text-emerald-500 font-black">99.4%</div>
          <div className="text-[11px] text-ink-600 dark:text-paper-300 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>0 rate-limit timeouts this week</span>
          </div>
        </div>

        <div className="comic-card bg-white dark:bg-ink-800 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-1">
            Deduplication Rate
          </div>
          <div className="font-comic text-3xl text-comic-blue font-black">14.2%</div>
          <div className="text-[11px] text-ink-600 dark:text-paper-300 mt-1 flex items-center gap-1">
            <CopyCheck className="w-3.5 h-3.5 text-comic-blue" />
            <span>Redundant URLs filtered</span>
          </div>
        </div>

        <div className="comic-card bg-white dark:bg-ink-800 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-1">
            GitHub Share
          </div>
          <div className="font-comic text-3xl text-ink-900 dark:text-paper-100 font-black">{githubPct}%</div>
          <div className="text-[11px] text-ink-600 dark:text-paper-300 mt-1">
            {githubCount} active repos indexed
          </div>
        </div>

        <div className="comic-card bg-white dark:bg-ink-800 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-1">
            Telegram Share
          </div>
          <div className="font-comic text-3xl text-[#229ED9] font-black">{telegramPct}%</div>
          <div className="text-[11px] text-ink-600 dark:text-paper-300 mt-1">
            {telegramCount} channel items indexed
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discoveries Over Time Bar Chart */}
        <div className="comic-card bg-white dark:bg-ink-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-paper-300 dark:border-ink-700">
            <div className="font-comic text-lg uppercase tracking-wider text-ink-900 dark:text-paper-50 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-comic-yellow" />
              <span>Discoveries Over Last 7 Days</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500">+24% vs prev week</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {weeklyDiscovery.map(item => {
              const heightPct = Math.round((item.count / maxDay) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-ink-600 dark:text-paper-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div className="w-full bg-paper-200 dark:bg-ink-900 rounded-t-lg border-2 border-ink-800 dark:border-paper-300 overflow-hidden h-36 flex items-end">
                    <div
                      className="w-full bg-comic-yellow group-hover:bg-yellow-400 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-ink-800 dark:text-paper-200">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources by Taxonomy Type */}
        <div className="comic-card bg-white dark:bg-ink-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-paper-300 dark:border-ink-700">
            <div className="font-comic text-lg uppercase tracking-wider text-ink-900 dark:text-paper-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-comic-blue" />
              <span>Resources By Taxonomy Type</span>
            </div>
            <span className="text-xs font-mono font-bold text-ink-600 dark:text-paper-300">Distribution</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedTypes.map(([type, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs font-bold text-ink-800 dark:text-paper-100 mb-1">
                    <span>{type}</span>
                    <span className="font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-paper-200 dark:bg-ink-900 rounded-full border-2 border-ink-800 dark:border-paper-300 overflow-hidden">
                    <div
                      className="h-full bg-comic-blue rounded-full"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
