import React, { useState, useEffect } from 'react';
import {
  Grid,
  List,
  ArrowUpDown,
  Filter as FilterIcon,
  SlidersHorizontal,
  BookmarkPlus
} from 'lucide-react';
import { Resource, DiscoveryFilters } from '../types';
import { SearchBar } from '../components/common/SearchBar';
import { ResourceCard } from '../components/resources/ResourceCard';
import { FilterPanel } from '../components/resources/FilterPanel';
import { EmptyState } from '../components/common/EmptyState';
import { ComicBadge } from '../components/comic/ComicBadge';

export interface ResourcesPageProps {
  resources: Resource[];
  total: number;
  filters: DiscoveryFilters;
  onFilterChange: (filters: DiscoveryFilters) => void;
  onOpenDetails: (resource: Resource) => void;
  onSaveResource: (resource: Resource) => void;
  onNavigateToDiscover: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  resources,
  total,
  filters,
  onFilterChange,
  onOpenDetails,
  onSaveResource,
  onNavigateToDiscover
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Most Stars', value: 'stars' },
    { label: 'Most Forks', value: 'forks' },
    { label: 'Newest Discovered', value: 'newest' },
    { label: 'Oldest Discovered', value: 'oldest' },
    { label: 'Alphabetical', value: 'alphabetical' }
  ];

  const handleResetFilters = () => {
    onFilterChange({
      search: '',
      sources: [],
      resourceTypes: [],
      languages: [],
      fileTypes: [],
      minStars: 0,
      sortBy: 'relevance',
      page: 1
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-comic text-3xl uppercase tracking-wider text-ink-900 dark:text-paper-50">
              DISCOVERED RESOURCES
            </h1>
            <ComicBadge variant="yellow" size="sm">
              {total} FOUND
            </ComicBadge>
          </div>
          <p className="text-xs text-ink-600 dark:text-paper-300">
            Browse, filter, and organize resources discovered across GitHub and Telegram.
          </p>
        </div>

        {/* View Mode & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden comic-btn bg-paper-100 dark:bg-ink-800 text-ink-900 dark:text-paper-100 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center p-1 rounded-xl bg-paper-200 dark:bg-ink-800 border-2 border-ink-800 dark:border-paper-300 shadow-comic-sm">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-comic-yellow text-ink-900 font-bold'
                  : 'text-ink-600 dark:text-paper-300 hover:text-ink-900'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-comic-yellow text-ink-900 font-bold'
                  : 'text-ink-600 dark:text-paper-300 hover:text-ink-900'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <SearchBar
            value={filters.search || ''}
            onChange={val => onFilterChange({ ...filters, search: val, page: 1 })}
            placeholder="Search keywords e.g. python, automation, pdf..."
          />
        </div>

        <div className="relative flex items-center">
          <ArrowUpDown className="absolute left-3.5 w-4 h-4 text-ink-600 dark:text-paper-300 pointer-events-none" />
          <select
            value={filters.sortBy || 'relevance'}
            onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as any, page: 1 })}
            className="w-full bg-white dark:bg-ink-800 text-ink-900 dark:text-paper-50 pl-10 pr-8 py-2.5 rounded-xl border-2 border-ink-800 dark:border-paper-300 text-xs font-bold shadow-comic-sm appearance-none focus:outline-none focus:ring-2 focus:ring-comic-yellow cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden md:block md:col-span-1 sticky top-20">
          <FilterPanel
            filters={filters}
            onChange={onFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 p-4 bg-ink-900/70 flex items-center justify-center md:hidden">
            <div className="max-w-sm w-full max-h-[90vh] overflow-y-auto">
              <FilterPanel
                filters={filters}
                onChange={f => {
                  onFilterChange(f);
                  setMobileFilterOpen(false);
                }}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Resource Items */}
        <div className="md:col-span-3 space-y-6">
          {resources.length === 0 ? (
            <EmptyState
              title="No resources matched your filters."
              speechText="LET'S GO HUNTING!"
              description="Try adjusting your keywords, toggling more sources, or launching a fresh discovery job."
              actionText="Hunt New Resources"
              onAction={onNavigateToDiscover}
            />
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {resources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpenDetails={onOpenDetails}
                  onSave={onSaveResource}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
