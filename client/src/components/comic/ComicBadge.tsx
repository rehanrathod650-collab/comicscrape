import React from 'react';

export interface ComicBadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'red' | 'green' | 'purple' | 'ink' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export const ComicBadge: React.FC<ComicBadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
  pulse = false
}) => {
  const variantStyles = {
    yellow: 'bg-comic-yellow text-ink-900 border-ink-800 shadow-comic-sm',
    blue: 'bg-comic-blue text-ink-900 border-ink-800 shadow-comic-sm',
    red: 'bg-comic-red text-white border-ink-800 shadow-comic-sm',
    green: 'bg-comic-green text-ink-900 border-ink-800 shadow-comic-sm',
    purple: 'bg-comic-purple text-ink-900 border-ink-800 shadow-comic-sm',
    ink: 'bg-ink-800 text-white border-ink-700 shadow-comic-sm dark:bg-ink-700 dark:border-paper-300',
    white: 'bg-white text-ink-900 border-ink-800 shadow-comic-sm dark:bg-ink-800 dark:text-white dark:border-paper-300'
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 tracking-wider',
    md: 'text-sm px-2.5 py-1 tracking-wider',
    lg: 'text-base px-3.5 py-1.5 tracking-widest font-extrabold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-comic uppercase rounded border-2 select-none ${variantStyles} ${sizeStyles} ${pulse ? 'comic-pulse' : ''} ${className}`}
    >
      {children}
    </span>
  );
};
