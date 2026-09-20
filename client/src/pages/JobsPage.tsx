import React, { useState } from 'react';
import {
  Terminal,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Send,
  Sparkles
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { ScraperJob, JobStatus } from '../types';
import { ComicBadge } from '../components/comic/ComicBadge';
import { SourceBadge } from '../components/common/SourceBadge';

export interface JobsPageProps {
  jobs: ScraperJob[];
  onRetryJob: (id: string) => void;
  onDeleteJob: (id: string) => void;
  onStartNewJob: () => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  jobs,
  onRetryJob,
  onDeleteJob,
  onStartNewJob
}) => {
  const [selectedJob, setSelectedJob] = useState<ScraperJob | null>(jobs[0] || null);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <ComicBadge variant="yellow" size="sm" pulse>
            POW! RUNNING
          </ComicBadge>
        );
      case 'COMPLETED':
        return (
          <ComicBadge variant="green" size="sm">
            DONE!
          </ComicBadge>
        );
      case 'FAILED':
        return (
          <ComicBadge variant="red" size="sm">
            ERROR!
          </ComicBadge>
        );
      case 'QUEUED':
        return (
          <ComicBadge variant="blue" size="sm">
            QUEUED
          </ComicBadge>
        );
      case 'CANCELLED':
        return (
          <ComicBadge variant="ink" size="sm">
            CANCELLED
          </ComicBadge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
              SCRAPER JOBS DASHBOARD
            </h1>
            <ComicBadge variant="blue" size="sm">
              {jobs.length} JOBS
            </ComicBadge>
          </div>
          <p className="text-xs text-ink-600 dark:text-paper-300">
            Monitor asynchronous discovery queues, background channel syncs, and rate limits.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartNewJob}
          className="comic-btn bg-comic-yellow text-ink-900 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto hover:bg-yellow-400"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch New Hunt</span>
        </button>
      </div>

      {/* Main Grid: Jobs Table + Selected Job Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Jobs List (2 Cols on lg) */}
        <div className="lg:col-span-2 comic-card bg-white dark:bg-ink-800 p-0 overflow-hidden shadow-comic">
          <div className="p-4 border-b-2 border-ink-800 dark:border-paper-300 bg-paper-100 dark:bg-ink-900 flex items-center justify-between">
            <span className="font-comic text-base tracking-wider uppercase text-ink-900 dark:text-paper-50">
              Active & Historic Jobs
            </span>
            <span className="text-[11px] font-bold text-ink-600 dark:text-paper-300">
              Live Worker Stream
            </span>
          </div>

          <div className="divide-y-2 divide-paper-200 dark:divide-ink-700">
            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-4 transition-colors cursor-pointer hover:bg-paper-100 dark:hover:bg-ink-700/50 ${
                  selectedJob?.id === job.id ? 'bg-comic-yellow/10 dark:bg-comic-yellow/5' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink-900 dark:text-paper-100">
                      #{job.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink-700 dark:text-paper-300 font-semibold uppercase">
                      {job.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div>{getStatusBadge(job.status)}</div>
                </div>

                <div className="font-bold text-sm text-ink-900 dark:text-paper-50 mb-1">
                  Query: "{job.query}"
                </div>

                <div className="text-xs text-ink-600 dark:text-paper-300 mb-3 line-clamp-1">
                  {job.currentTask}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-paper-200 dark:border-ink-700/60">
                  <div className="flex items-center gap-2">
                    {job.sources.map(s => (
                      <SourceBadge key={s} source={s} size="sm" />
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-ink-700 dark:text-paper-300 text-[11px] font-medium">
                    <span>
                      Found: <strong className="text-ink-900 dark:text-paper-100">{job.resourcesFound}</strong>
                    </span>
                    <span>
                      Deduplicated: <strong className="text-ink-900 dark:text-paper-100">{job.duplicatesFound}</strong>
                    </span>
                    <span>{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Job Inspector Details (1 Col on lg) */}
        <div className="lg:col-span-1 comic-card bg-white dark:bg-ink-800 p-5 space-y-5 sticky top-20 shadow-comic">
          {selectedJob ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b-2 border-paper-300 dark:border-ink-700">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300">
                    Job Inspector
                  </div>
                  <div className="font-mono text-xs font-bold text-ink-900 dark:text-paper-50">
                    {selectedJob.id}
                  </div>
                </div>
                {getStatusBadge(selectedJob.status)}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Job Progress</span>
                  <span>{selectedJob.progress}%</span>
                </div>
                <div className="w-full h-3 bg-paper-200 dark:bg-ink-900 rounded-full border-2 border-ink-800 dark:border-paper-300 overflow-hidden">
                  <div
                    className="h-full bg-comic-yellow transition-all duration-300 rounded-full"
                    style={{ width: `${selectedJob.progress}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
                  <div className="text-[10px] font-bold uppercase text-ink-600 dark:text-paper-300">
                    Resources Found
                  </div>
                  <div className="text-lg font-comic font-black text-ink-900 dark:text-paper-50">
                    {selectedJob.resourcesFound}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
                  <div className="text-[10px] font-bold uppercase text-ink-600 dark:text-paper-300">
                    Duplicates Filtered
                  </div>
                  <div className="text-lg font-comic font-black text-ink-900 dark:text-paper-50">
                    {selectedJob.duplicatesFound}
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 mb-2">
                  Task Execution Logs:
                </div>
                <div className="p-3 rounded-xl bg-paper-100 dark:bg-ink-900 border-2 border-ink-800 dark:border-paper-300 max-h-48 overflow-y-auto space-y-2 text-[11px] font-mono">
                  {selectedJob.logs.map((log, i) => (
                    <div key={i} className="leading-tight">
                      <span className="text-ink-500 dark:text-paper-400">[{log.timestamp}]</span>{' '}
                      <span className="font-bold text-ink-900 dark:text-paper-100">{log.step}:</span>{' '}
                      <span className="text-ink-700 dark:text-paper-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t-2 border-paper-300 dark:border-ink-700 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onRetryJob(selectedJob.id)}
                  className="comic-btn bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Job</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteJob(selectedJob.id)}
                  className="comic-btn bg-comic-red text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-xs text-ink-600 dark:text-paper-300">
              Select a job to view diagnostics and execution logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
