import React from 'react';
import {
  Send,
  FileText,
  Link2,
  Database,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { Resource } from '../types';
import { StatsCard } from '../components/common/StatsCard';
import { ResourceCard } from '../components/resources/ResourceCard';
import { SpeechBubble } from '../components/comic/SpeechBubble';
import { ComicBadge } from '../components/comic/ComicBadge';

export interface DashboardPageProps {
  resources: Resource[];
  onNavigate: (tab: string) => void;
  onOpenDetails: (resource: Resource) => void;
  onSaveResource: (resource: Resource) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  resources,
  onNavigate,
  onOpenDetails,
  onSaveResource
}) => {
  const githubCount = resources.filter(r => r.sourceType === 'GITHUB').length;
  const telegramCount = resources.filter(r => r.sourceType === 'TELEGRAM').length;
  const docCount = resources.filter(r => ['PDF', 'EBOOK', 'DOCUMENTATION'].includes(r.resourceType)).length;
  const linkCount = resources.filter(r => r.resourceType === 'LINK').length;
  const totalCount = resources.length;

  const recentResources = [...resources]
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero / Command Center Banner */}
      <div className="comic-card bg-paper-50 dark:bg-ink-800 p-6 sm:p-8 relative overflow-hidden bg-halftone">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <ComicBadge variant="yellow" size="sm">
              COMMAND CENTER
            </ComicBadge>
            <ComicBadge variant="green" size="sm">
              ENGINE ACTIVE
            </ComicBadge>
          </div>

          <h1 className="font-comic text-4xl sm:text-5xl text-ink-900 dark:text-paper-50 tracking-wide uppercase leading-tight mb-2">
            RESOURCE COMMAND CENTER
          </h1>

          <p className="text-sm sm:text-base text-ink-700 dark:text-paper-200 mb-6 font-medium">
            Discover useful developer tools, repositories, PDFs, and notes across GitHub and authorized Telegram sources in one unified hub.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('discover')}
              className="comic-btn bg-comic-yellow text-ink-900 text-sm sm:text-base px-6 py-3 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 hover:bg-yellow-400"
            >
              <Compass className="w-5 h-5" />
              <span>+ Discover Resources</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('resources')}
              className="comic-btn bg-white dark:bg-ink-700 text-ink-900 dark:text-paper-100 text-sm sm:text-base px-5 py-3 rounded-xl font-comic tracking-wider uppercase flex items-center gap-2 hover:bg-paper-200 dark:hover:bg-ink-600"
            >
              <span>Explore All Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comic speech bubble in hero */}
        <div className="hidden lg:block absolute top-8 right-8 max-w-xs">
          <SpeechBubble icon={<Sparkles className="w-5 h-5 text-comic-yellow" />}>
            READY TO HUNT THE GALAXY FOR NEW SCRIPTS & DOCS!
          </SpeechBubble>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="GitHub"
          source="GITHUB"
          value={12482 + githubCount}
          subtitle="repositories indexed"
          icon={GithubIcon}
          trend="+342 this week"
          accentColor="yellow"
        />
        <StatsCard
          title="Telegram"
          source="TELEGRAM"
          value={8640 + telegramCount}
          subtitle="posts & media indexed"
          icon={Send}
          trend="+518 this week"
          accentColor="blue"
        />
        <StatsCard
          title="Documents"
          value={3920 + docCount}
          subtitle="PDFs & guides found"
          icon={FileText}
          trend="+184 this week"
          accentColor="red"
        />
        <StatsCard
          title="Direct Links"
          value={4510 + linkCount}
          subtitle="curated articles & tools"
          icon={Link2}
          trend="+92 this week"
          accentColor="green"
        />
        <StatsCard
          title="Total Resources"
          value={29552 + totalCount}
          subtitle="deduplicated catalog"
          icon={Database}
          trend="99.2% indexed"
          accentColor="yellow"
        />
      </div>

      {/* Recent Discoveries Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-comic text-2xl tracking-wide uppercase text-ink-900 dark:text-paper-50">
              FRESH DISCOVERIES
            </div>
            <p className="text-xs text-ink-600 dark:text-paper-300">
              Recently ingested and classified items across all monitored channels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('resources')}
            className="text-xs font-bold text-comic-blue hover:underline flex items-center gap-1"
          >
            <span>View All ({resources.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recentResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onOpenDetails={onOpenDetails}
              onSave={onSaveResource}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
