import React, { useState } from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  Bookmark,
  Info,
  FileText,
  FolderArchive,
  BookOpen,
  Code,
  Layers,
  Check
} from 'lucide-react';
import { Resource } from '../../types';
import { SourceBadge } from '../common/SourceBadge';
import { Tag } from '../common/Tag';
import { ComicBadge } from '../comic/ComicBadge';

export interface ResourceCardProps {
  resource: Resource;
  onOpenDetails: (resource: Resource) => void;
  onSave?: (resource: Resource) => void;
  isSaved?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onOpenDetails,
  onSave,
  isSaved = false
}) => {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) onSave(resource);
  };

  const isGithub = resource.sourceType === 'GITHUB';

  // Format file size
  const formatBytes = (bytes?: number) => {
    if (!bytes) return null;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get icon for resource type
  const getTypeIcon = () => {
    switch (resource.resourceType) {
      case 'PDF':
      case 'DOCUMENTATION':
        return <FileText className="w-4 h-4 text-comic-red" />;
      case 'ZIP':
        return <FolderArchive className="w-4 h-4 text-comic-yellow" />;
      case 'EBOOK':
      case 'TUTORIAL':
      case 'COURSE':
        return <BookOpen className="w-4 h-4 text-comic-blue" />;
      case 'CODE':
      case 'REPOSITORY':
        return <Code className="w-4 h-4 text-emerald-500" />;
      default:
        return <Layers className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(resource)}
      className="comic-card comic-card-hover bg-white dark:bg-ink-800 p-5 flex flex-col justify-between cursor-pointer group transition-all"
    >
      <div>
        {/* Top bar: Source Badge, Resource Type & Demo flag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <SourceBadge source={resource.sourceType} size="sm" />
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink-700 dark:text-paper-200 border border-ink-600/20">
              {getTypeIcon()}
              <span>{resource.resourceType}</span>
            </span>
          </div>
          {resource.isDemo && (
            <ComicBadge variant="yellow" size="sm">
              DEMO
            </ComicBadge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-base text-ink-900 dark:text-paper-50 group-hover:text-comic-blue dark:group-hover:text-comic-yellow transition-colors line-clamp-2 mb-2 leading-snug">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-ink-600 dark:text-paper-300 line-clamp-3 mb-4 leading-relaxed">
          {resource.description || 'No description provided.'}
        </p>

        {/* Source metadata indicators */}
        {isGithub ? (
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-700 dark:text-paper-200 mb-4 py-2 px-2.5 rounded-lg bg-paper-100 dark:bg-ink-900/60 border border-paper-300 dark:border-ink-700">
            {resource.stars > 0 && (
              <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{resource.stars.toLocaleString()}</span>
              </span>
            )}
            {resource.forks > 0 && (
              <span className="flex items-center gap-1 text-ink-600 dark:text-paper-300">
                <GitFork className="w-3.5 h-3.5" />
                <span>{resource.forks.toLocaleString()}</span>
              </span>
            )}
            {resource.language && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-comic-blue" />
                <span>{resource.language}</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between text-xs text-ink-700 dark:text-paper-200 mb-4 py-2 px-2.5 rounded-lg bg-paper-100 dark:bg-ink-900/60 border border-paper-300 dark:border-ink-700">
            <span className="font-medium truncate max-w-[180px]">
              Channel: <span className="font-bold">@{resource.channel || 'Telegram'}</span>
            </span>
            {resource.fileSize && (
              <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-700">
                {formatBytes(resource.fileSize)}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {resource.tags.slice(0, 4).map(tag => (
              <Tag key={tag} label={tag} />
            ))}
            {resource.tags.length > 4 && (
              <span className="text-[11px] text-ink-600 dark:text-paper-300 self-center">
                +{resource.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t-2 border-paper-200 dark:border-ink-700/60 flex items-center justify-between gap-2 mt-auto">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="comic-btn bg-paper-100 dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-paper-200 dark:hover:bg-ink-600"
          title="Open original source directly"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{isGithub ? 'Open Source' : 'Open'}</span>
        </a>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            className={`comic-btn text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
              saved
                ? 'bg-comic-yellow text-ink-900 font-bold'
                : 'bg-paper-100 dark:bg-ink-700 text-ink-800 dark:text-paper-200 hover:bg-paper-200 dark:hover:bg-ink-600'
            }`}
            title="Save to collection"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDetails(resource)}
            className="comic-btn bg-comic-blue text-ink-900 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-sky-400 font-bold"
            title="View details & metadata"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
