import React from 'react';

export interface TagProps {
  label: string;
  onClick?: () => void;
  selected?: boolean;
}

export const Tag: React.FC<TagProps> = ({ label, onClick, selected = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
        selected
          ? 'bg-comic-yellow text-ink-900 border-ink-800 font-bold shadow-comic-sm'
          : 'bg-paper-200 text-ink-700 border-ink-600/30 hover:border-ink-800 hover:bg-paper-300 dark:bg-ink-800 dark:text-paper-200 dark:border-ink-600 dark:hover:border-paper-200'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      #{label}
    </button>
  );
};
