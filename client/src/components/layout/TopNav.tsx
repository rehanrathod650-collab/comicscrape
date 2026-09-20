import React, { useState } from 'react';
import {
  Zap,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { SearchBar } from '../common/SearchBar';

export interface TopNavProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileMenu: () => void;
  onSearch: (q: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenMobileMenu,
  onSearch,
  notifications,
  onMarkNotificationRead,
  activeTab,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (val: string) => {
    setGlobalQuery(val);
    onSearch(val);
    if (val.trim() && activeTab !== 'resources') {
      onNavigate('resources');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md border-b-2 border-ink-800 dark:border-paper-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg border-2 border-ink-800 dark:border-paper-300 bg-paper-100 dark:bg-ink-800 hover:bg-comic-yellow text-ink-900 dark:text-paper-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-comic-yellow text-ink-900 border-2 border-ink-800 shadow-comic-sm flex items-center justify-center font-black transition-transform group-hover:scale-105">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="font-comic text-2xl tracking-wider text-ink-900 dark:text-paper-50 leading-none">
                COMICSCRAPE
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-600 dark:text-comic-yellow">
                Resource Discovery Hub
              </div>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <SearchBar
            value={globalQuery}
            onChange={handleSearchSubmit}
            placeholder="Global hunt across GitHub & Telegram..."
          />
        </div>

        {/* Right: Actions (Theme, Notifications, Profile) */}
        <div className="flex items-center gap-2.5">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border-2 border-ink-800 dark:border-paper-300 bg-paper-100 dark:bg-ink-800 hover:bg-comic-yellow dark:hover:bg-comic-yellow hover:text-ink-900 text-ink-800 dark:text-paper-200 shadow-comic-sm transition-all"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-comic-yellow" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border-2 border-ink-800 dark:border-paper-300 bg-paper-100 dark:bg-ink-800 hover:bg-comic-yellow hover:text-ink-900 text-ink-800 dark:text-paper-200 shadow-comic-sm transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-comic-red text-white text-[10px] font-black border border-ink-800 flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 comic-card bg-white dark:bg-ink-800 p-0 z-50 shadow-comic-lg">
                <div className="p-3 border-b-2 border-ink-800 dark:border-paper-300 bg-paper-100 dark:bg-ink-900 flex items-center justify-between">
                  <div className="font-comic text-sm tracking-wider uppercase text-ink-900 dark:text-paper-50">
                    Notifications ({unreadCount})
                  </div>
                  <span className="text-[11px] font-bold text-ink-600 dark:text-paper-300">Live Alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-paper-300 dark:divide-ink-700">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-ink-600 dark:text-paper-300">
                      No notifications yet!
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs transition-colors ${
                          notif.read ? 'opacity-70' : 'bg-comic-yellow/10 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-ink-900 dark:text-paper-100">
                            {notif.title}
                          </div>
                          {!notif.read && (
                            <button
                              type="button"
                              onClick={() => onMarkNotificationRead(notif.id)}
                              className="text-[11px] text-comic-blue hover:underline flex items-center gap-0.5"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Read</span>
                            </button>
                          )}
                        </div>
                        <p className="text-ink-700 dark:text-paper-200 mt-1 leading-snug">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-ink-600 dark:text-paper-300 mt-1">
                          {notif.createdAt}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-paper-300 dark:border-ink-700">
            <div className="w-8 h-8 rounded-lg bg-ink-900 text-comic-yellow border-2 border-ink-800 dark:border-paper-300 flex items-center justify-center font-comic font-black text-sm shadow-comic-sm">
              HQ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
