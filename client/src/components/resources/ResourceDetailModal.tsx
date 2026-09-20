import React from 'react';
import {
  ExternalLink,
  Star,
  GitFork,
  Calendar,
  FileCode,
  Tag as TagIcon,
  Shield,
  Layers,
  Database
} from 'lucide-react';
import { Resource } from '../../types';
import { Modal } from '../common/Modal';
import { SourceBadge } from '../common/SourceBadge';
import { Tag } from '../common/Tag';
import { ComicBadge } from '../comic/ComicBadge';

export interface ResourceDetailModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSave
}) => {
  if (!resource) return null;

  const isGithub = resource.sourceType === 'GITHUB';

  const formatBytes = (bytes?: number) => {
    if (!bytes) return null;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGithub ? 'GitHub Repository Details' : 'Telegram Resource Details'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Source & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-paper-100 dark:bg-ink-900 border-2 border-ink-800 dark:border-paper-300 shadow-comic-sm">
          <div className="flex items-center gap-2.5">
            <SourceBadge source={resource.sourceType} />
            <ComicBadge variant="blue" size="sm">
              {resource.resourceType}
            </ComicBadge>
            {resource.isDemo && (
              <ComicBadge variant="yellow" size="sm">
                DEMO DATA
              </ComicBadge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="comic-btn bg-comic-yellow text-ink-900 text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-400 font-comic uppercase tracking-wider"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN ORIGINAL</span>
            </a>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-black text-ink-900 dark:text-paper-50 mb-2 leading-tight">
            {resource.title}
          </h1>
          <p className="text-sm text-ink-700 dark:text-paper-200 leading-relaxed">
            {resource.description || 'No description available for this resource.'}
          </p>
        </div>

        {/* Specific Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Canonical / Origin */}
          <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1 mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>{isGithub ? 'Repository' : 'Channel'}</span>
            </div>
            <div className="text-xs font-semibold text-ink-900 dark:text-paper-100 truncate">
              {isGithub ? `${resource.owner || ''}/${resource.repository || ''}` : `@${resource.channel || 'Telegram'}`}
            </div>
          </div>

          {/* GitHub Stats */}
          {isGithub && (
            <>
              <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Stars</span>
                </div>
                <div className="text-xs font-semibold text-ink-900 dark:text-paper-100">
                  {resource.stars.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1 mb-1">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Forks</span>
                </div>
                <div className="text-xs font-semibold text-ink-900 dark:text-paper-100">
                  {resource.forks.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
                <div className="text-[11px] font-bold uppercase tracking-wider text-comic-blue flex items-center gap-1 mb-1">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Language</span>
                </div>
                <div className="text-xs font-semibold text-ink-900 dark:text-paper-100">
                  {resource.language || 'Multi-language'}
                </div>
              </div>
            </>
          )}

          {/* Telegram Stats */}
          {!isGithub && (
            <>
              {resource.fileName && (
                <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600 col-span-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1 mb-1">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>File Attachment</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-ink-900 dark:text-paper-100 truncate">
                    {resource.fileName} ({formatBytes(resource.fileSize)})
                  </div>
                </div>
              )}
            </>
          )}

          {/* License */}
          {resource.license && (
            <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1 mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>License</span>
              </div>
              <div className="text-xs font-semibold text-ink-900 dark:text-paper-100">
                {resource.license}
              </div>
            </div>
          )}

          {/* Discovered Date */}
          <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-700 border border-paper-300 dark:border-ink-600">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Discovered</span>
            </div>
            <div className="text-xs font-semibold text-ink-900 dark:text-paper-100">
              {new Date(resource.discoveredAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1.5 mb-2">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Tags & Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map(t => (
                <Tag key={t} label={t} />
              ))}
            </div>
          </div>
        )}

        {/* README / Content Preview */}
        {resource.readmePreview && (
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300 flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>README Document Preview</span>
            </div>
            <div className="p-4 rounded-xl bg-paper-100 dark:bg-ink-900 border-2 border-ink-800 dark:border-paper-300 overflow-x-auto max-h-64 text-xs font-mono text-ink-800 dark:text-paper-200 whitespace-pre-wrap leading-relaxed shadow-comic-sm">
              {resource.readmePreview}
            </div>
          </div>
        )}

        {/* Original link attribution reminder */}
        <div className="p-3 rounded-lg bg-comic-yellow/15 border border-comic-yellow/50 text-[11px] text-ink-700 dark:text-paper-200">
          <span className="font-bold">Attribution Notice:</span> ComicScrape indexes public and authorized metadata. All rights and content belong to the respective original creators on {isGithub ? 'GitHub' : 'Telegram'}.
        </div>
      </div>
    </Modal>
  );
};
