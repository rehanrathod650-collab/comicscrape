import React from 'react';

export interface SpeechBubbleProps {
  children: React.ReactNode;
  tail?: 'bottom' | 'none';
  className?: string;
  icon?: React.ReactNode;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  tail = 'bottom',
  className = '',
  icon
}) => {
  return (
    <div
      className={`speech-bubble p-4 text-ink-800 dark:text-paper-100 ${
        tail === 'bottom' ? 'speech-bubble-tail-bottom mb-3' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icon && <div className="flex-shrink-0 text-xl">{icon}</div>}
        <div className="font-comic text-lg uppercase tracking-wide leading-tight">
          {children}
        </div>
      </div>
    </div>
  );
};
