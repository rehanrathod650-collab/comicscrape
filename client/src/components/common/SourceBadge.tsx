import React from 'react';
import { Send } from 'lucide-react';
import { GithubIcon } from './Icons';
import { SourceType } from '../../types';

export interface SourceBadgeProps {
  source: SourceType;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  size = 'md',
  showIcon = true
}) => {
  const isGithub = source === 'GITHUB';

  const baseClasses = 'inline-flex items-center gap-1.5 font-bold uppercase rounded-md border-2 select-none';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (isGithub) {
    return (
      <span
        className={`${baseClasses} ${sizeClasses} bg-ink-900 text-white border-ink-800 shadow-comic-sm dark:bg-ink-700 dark:border-paper-300`}
        title="Source: GitHub Official API"
      >
        {showIcon && <GithubIcon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
        <span>GITHUB</span>
      </span>
    );
  }

  return (
    <span
      className={`${baseClasses} ${sizeClasses} bg-[#229ED9] text-white border-ink-800 shadow-comic-sm dark:border-paper-300`}
      title="Source: Telegram Authorized/Public Channel"
    >
      {showIcon && <Send className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>TELEGRAM</span>
    </span>
  );
};
