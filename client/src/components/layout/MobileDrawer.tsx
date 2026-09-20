import React from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-ink-900 shadow-comic-lg border-r-2 border-ink-800 dark:border-paper-300 z-10 animate-slide-in">
        <div className="p-4 border-b-2 border-ink-800 dark:border-paper-300 flex items-center justify-between">
          <span className="font-comic text-lg uppercase tracking-wider text-ink-900 dark:text-paper-50">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-ink-800 dark:border-paper-300 bg-paper-200 dark:bg-ink-700"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar
            activeTab={activeTab}
            onNavigate={tab => {
              onNavigate(tab);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
