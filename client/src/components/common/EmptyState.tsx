import React from 'react';
import { Compass, Plus } from 'lucide-react';
import { SpeechBubble } from '../comic/SpeechBubble';

export interface EmptyStateProps {
  title?: string;
  speechText?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No resources discovered yet.',
  speechText = "LET'S GO HUNTING!",
  description = 'Try searching with different keywords or starting a fresh discovery job across GitHub and Telegram.',
  actionText = 'Start Discovery',
  onAction
}) => {
  return (
    <div className="comic-card bg-white dark:bg-ink-800 p-8 md:p-12 text-center max-w-lg mx-auto my-8 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-comic-yellow text-ink-900 border-2 border-ink-800 shadow-comic flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <SpeechBubble className="mb-4">
        {speechText}
      </SpeechBubble>

      <h3 className="text-xl font-extrabold text-ink-900 dark:text-paper-50 mb-2">
        {title}
      </h3>

      <p className="text-sm text-ink-600 dark:text-paper-300 max-w-sm mb-6">
        {description}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="comic-btn bg-comic-yellow text-ink-900 px-5 py-2.5 rounded-xl font-comic text-base uppercase tracking-wider flex items-center gap-2 hover:bg-yellow-400"
        >
          <Plus className="w-5 h-5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
