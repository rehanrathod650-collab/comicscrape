import React, { useState, useEffect } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { NotificationItem } from '../../types';

export interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onSearch: (query: string) => void;
  resourceCount: number;
  jobCount: number;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onNavigate,
  onSearch,
  resourceCount,
  jobCount,
  notifications,
  onMarkNotificationRead,
  darkMode,
  onToggleDarkMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 text-ink-900 dark:bg-ink-900 dark:text-paper-100 transition-colors duration-200">
      {/* Top Navigation */}
      <TopNav
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onSearch={onSearch}
        notifications={notifications}
        onMarkNotificationRead={onMarkNotificationRead}
        activeTab={activeTab}
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onNavigate={onNavigate}
            resourceCount={resourceCount}
            jobCount={jobCount}
          />
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeTab={activeTab}
          onNavigate={onNavigate}
        />

        {/* Primary Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Comic Footer */}
      <footer className="border-t-2 border-ink-800 dark:border-paper-300 py-4 px-6 bg-white dark:bg-ink-900 text-center text-xs text-ink-600 dark:text-paper-300 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-comic text-sm tracking-wider uppercase text-ink-900 dark:text-paper-50">
            COMICSCRAPE — THE MODERN TECH RESOURCE HUNTER
          </div>
          <div>
            Built with GitHub Official API & authorized Telegram collectors • Zero scraping bypasses
          </div>
        </div>
      </footer>
    </div>
  );
};
