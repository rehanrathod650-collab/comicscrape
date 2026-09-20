import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Layers,
  Send,
  FolderTree,
  BookmarkCheck,
  Terminal,
  BarChart3,
  Sliders,
  Activity
} from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { ComicBadge } from '../comic/ComicBadge';

export interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  resourceCount?: number;
  jobCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  resourceCount = 0,
  jobCount = 0
}) => {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Discover Resources', icon: Compass, badge: 'HOT' },
    { id: 'resources', label: 'All Resources', icon: Layers, count: resourceCount },
    { id: 'github', label: 'GitHub Sources', icon: GithubIcon },
    { id: 'telegram', label: 'Telegram Sources', icon: Send },
    { id: 'collections', label: 'Collections', icon: FolderTree },
    { id: 'saved-searches', label: 'Saved Searches', icon: BookmarkCheck },
    { id: 'jobs', label: 'Scraper Jobs', icon: Terminal, count: jobCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sources', label: 'Sources Config', icon: Sliders },
    { id: 'admin', label: 'System Health', icon: Activity }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-ink-900 border-r-2 border-ink-800 dark:border-paper-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-ink-600 dark:text-comic-yellow">
          Navigation
        </div>

        {mainNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all font-bold text-xs ${
                isActive
                  ? 'bg-comic-yellow text-ink-900 border-ink-800 shadow-comic-sm dark:text-ink-900'
                  : 'border-transparent text-ink-700 dark:text-paper-200 hover:bg-paper-200 dark:hover:bg-ink-800 hover:border-ink-800/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-ink-900' : 'text-ink-600 dark:text-paper-300'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <ComicBadge variant="red" size="sm" pulse>
                  {item.badge}
                </ComicBadge>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                  isActive
                    ? 'bg-ink-900 text-white'
                    : 'bg-paper-200 dark:bg-ink-800 text-ink-700 dark:text-paper-300'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Comic Callout Box */}
      <div className="mt-8 p-3.5 rounded-xl bg-paper-100 dark:bg-ink-800 border-2 border-ink-800 dark:border-paper-300 shadow-comic-sm">
        <div className="font-comic text-xs uppercase tracking-wider text-ink-900 dark:text-comic-yellow mb-1 flex items-center justify-between">
          <span>Engine Status</span>
          <span className="w-2 h-2 rounded-full bg-comic-green animate-pulse" />
        </div>
        <p className="text-[11px] text-ink-600 dark:text-paper-300 leading-tight">
          Ready to hunt across authorized channels and GitHub APIs.
        </p>
      </div>
    </aside>
  );
};
