import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search resources, tags, topics, repositories...',
  className = '',
  size = 'md',
  autoFocus = false
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search
        className={`absolute left-3.5 text-ink-600 dark:text-paper-300 pointer-events-none ${
          size === 'lg' ? 'w-5 h-5 left-4' : 'w-4 h-4'
        }`}
      />
      <input
        type="text"
        autoFocus={autoFocus}
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-white dark:bg-ink-800 text-ink-900 dark:text-paper-50 placeholder-ink-600/60 dark:placeholder-paper-300/60 border-2 border-ink-800 dark:border-paper-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-comic-yellow transition-all ${
          size === 'lg'
            ? 'pl-12 pr-10 py-3.5 text-base shadow-comic'
            : 'pl-10 pr-9 py-2 text-sm shadow-comic-sm'
        }`}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 text-ink-600 hover:text-ink-900 dark:text-paper-300 dark:hover:text-white rounded-full hover:bg-paper-200 dark:hover:bg-ink-700 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
