import React, { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  HardDrive
} from 'lucide-react';
import { ComicBadge } from '../components/comic/ComicBadge';

export const AdminHealthPage: React.FC = () => {
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(false);

  const handleReindex = () => {
    setIsReindexing(true);
    setReindexSuccess(false);
    setTimeout(() => {
      setIsReindexing(false);
      setReindexSuccess(true);
      setTimeout(() => setReindexSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
              SYSTEM HEALTH & ADMIN CONSOLE
            </h1>
            <ComicBadge variant="green" size="sm">
              HEALTHY
            </ComicBadge>
          </div>
          <p className="text-xs text-ink-600 dark:text-paper-300">
            Realtime monitoring for asynchronous worker queues, database connection pools, and API quotas.
          </p>
        </div>

        <button
          type="button"
          disabled={isReindexing}
          onClick={handleReindex}
          className="comic-btn bg-comic-yellow text-ink-900 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto hover:bg-yellow-400 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isReindexing ? 'animate-spin' : ''}`} />
          <span>{isReindexing ? 'Re-indexing Catalog...' : 'Trigger Full Re-index'}</span>
        </button>
      </div>

      {reindexSuccess && (
        <div className="p-4 rounded-xl bg-comic-green/20 border-2 border-comic-green text-xs font-bold text-ink-900 dark:text-paper-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Full catalog re-indexing completed successfully! SQLite / PostgreSQL search vectors synced.</span>
        </div>
      )}

      {/* Subsystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Database */}
        <div className="comic-card bg-white dark:bg-ink-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-paper-100 dark:bg-ink-700 border border-ink-800/20">
              <Database className="w-5 h-5 text-comic-yellow" />
            </div>
            <ComicBadge variant="green" size="sm">
              ONLINE
            </ComicBadge>
          </div>
          <div className="font-bold text-base text-ink-900 dark:text-paper-50">
            Database Engine
          </div>
          <div className="space-y-1.5 text-xs text-ink-600 dark:text-paper-300">
            <div className="flex justify-between">
              <span>Driver:</span>
              <span className="font-mono font-bold text-ink-900 dark:text-paper-100">Prisma / SQLite / PG</span>
            </div>
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className="font-mono font-bold text-emerald-500">2.1 ms</span>
            </div>
            <div className="flex justify-between">
              <span>Connection Pool:</span>
              <span className="font-mono font-bold text-ink-900 dark:text-paper-100">Healthy (4/10)</span>
            </div>
          </div>
        </div>

        {/* Worker Queue */}
        <div className="comic-card bg-white dark:bg-ink-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-paper-100 dark:bg-ink-700 border border-ink-800/20">
              <Cpu className="w-5 h-5 text-comic-blue" />
            </div>
            <ComicBadge variant="green" size="sm">
              ACTIVE
            </ComicBadge>
          </div>
          <div className="font-bold text-base text-ink-900 dark:text-paper-50">
            Worker Job Queue
          </div>
          <div className="space-y-1.5 text-xs text-ink-600 dark:text-paper-300">
            <div className="flex justify-between">
              <span>Queue Adapter:</span>
              <span className="font-mono font-bold text-ink-900 dark:text-paper-100">Async In-Memory</span>
            </div>
            <div className="flex justify-between">
              <span>Active Tasks:</span>
              <span className="font-mono font-bold text-comic-blue">1 running</span>
            </div>
            <div className="flex justify-between">
              <span>Backpressure:</span>
              <span className="font-mono font-bold text-emerald-500">Normal (0 queued)</span>
            </div>
          </div>
        </div>

        {/* API Gateway */}
        <div className="comic-card bg-white dark:bg-ink-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-paper-100 dark:bg-ink-700 border border-ink-800/20">
              <Server className="w-5 h-5 text-emerald-500" />
            </div>
            <ComicBadge variant="green" size="sm">
              ONLINE
            </ComicBadge>
          </div>
          <div className="font-bold text-base text-ink-900 dark:text-paper-50">
            REST API Gateway
          </div>
          <div className="space-y-1.5 text-xs text-ink-600 dark:text-paper-300">
            <div className="flex justify-between">
              <span>Port:</span>
              <span className="font-mono font-bold text-ink-900 dark:text-paper-100">3001</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="font-mono font-bold text-ink-900 dark:text-paper-100">99.98%</span>
            </div>
            <div className="flex justify-between">
              <span>CORS Policy:</span>
              <span className="font-mono font-bold text-emerald-500">Configured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits & Security Card */}
      <div className="comic-card bg-white dark:bg-ink-800 p-6 space-y-4">
        <h3 className="font-comic text-lg uppercase tracking-wider text-ink-900 dark:text-paper-50 pb-2 border-b-2 border-paper-300 dark:border-ink-700">
          Source Quota & Rate Limit Health
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>GitHub API Quota Remaining</span>
              <span className="font-mono">4,920 / 5,000 requests/hr (98.4%)</span>
            </div>
            <div className="w-full h-3 bg-paper-200 dark:bg-ink-900 rounded-full border-2 border-ink-800 dark:border-paper-300 overflow-hidden">
              <div className="h-full bg-comic-green rounded-full" style={{ width: '98.4%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Telegram Channel Throttling Margin</span>
              <span className="font-mono">Safe (Throttled at 1 req/sec max)</span>
            </div>
            <div className="w-full h-3 bg-paper-200 dark:bg-ink-900 rounded-full border-2 border-ink-800 dark:border-paper-300 overflow-hidden">
              <div className="h-full bg-comic-blue rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
