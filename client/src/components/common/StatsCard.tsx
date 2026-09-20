import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import { SourceType } from '../../types';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  trend?: string;
  source?: SourceType;
  accentColor?: 'yellow' | 'blue' | 'red' | 'green';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  source,
  accentColor = 'yellow'
}) => {
  const accentBorder = {
    yellow: 'border-l-4 border-l-comic-yellow',
    blue: 'border-l-4 border-l-comic-blue',
    red: 'border-l-4 border-l-comic-red',
    green: 'border-l-4 border-l-comic-green'
  }[accentColor];

  return (
    <div className={`comic-card comic-card-hover bg-white dark:bg-ink-800 p-5 relative overflow-hidden ${accentBorder}`}>
      {/* Corner comic accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-t-ink-800 dark:border-t-paper-300 border-l-[28px] border-l-transparent" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {source ? (
            <SourceBadge source={source} size="sm" />
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-ink-600 dark:text-paper-300">
              {title}
            </span>
          )}
        </div>
        <div className="p-2 rounded-lg bg-paper-100 dark:bg-ink-700 text-ink-800 dark:text-paper-100 border border-ink-800/20">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-1">
        <div className="text-3xl font-extrabold font-comic text-ink-900 dark:text-paper-50 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs font-medium text-ink-600 dark:text-paper-300 mt-0.5">
          {subtitle}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-paper-300 dark:border-ink-700 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
