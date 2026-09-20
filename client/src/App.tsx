import React, { useState, useEffect } from 'react';
import {
  Resource,
  ScraperJob,
  Collection,
  SavedSearch,
  SourceConfig,
  NotificationItem,
  DiscoveryFilters,
  SourceType
} from './types';
import { apiClient } from './api/client';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { JobsPage } from './pages/JobsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { SavedSearchesPage } from './pages/SavedSearchesPage';
import { SourcesPage } from './pages/SourcesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminHealthPage } from './pages/AdminHealthPage';
import { ResourceDetailModal } from './components/resources/ResourceDetailModal';
import { Modal } from './components/common/Modal';
import { SpeechBubble } from './components/comic/SpeechBubble';
import { ComicBadge } from './components/comic/ComicBadge';
import { Send, Compass, Sparkles } from 'lucide-react';
import { GithubIcon } from './components/common/Icons';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resources, setResources] = useState<Resource[]>([]);
  const [totalResources, setTotalResources] = useState(0);
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeJob, setActiveJob] = useState<ScraperJob | null>(null);

  // Filters
  const [filters, setFilters] = useState<DiscoveryFilters>({
    search: '',
    sources: [],
    resourceTypes: [],
    languages: [],
    fileTypes: [],
    minStars: 0,
    sortBy: 'relevance',
    page: 1,
    limit: 30
  });

  // Modals & Details
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [firstRunOpen, setFirstRunOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('comicscrape_dark') !== 'false';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('comicscrape_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('comicscrape_dark', 'false');
    }
  }, [darkMode]);

  // Check first-run
  useEffect(() => {
    const hasSeenFirstRun = localStorage.getItem('comicscrape_first_run');
    if (!hasSeenFirstRun) {
      setFirstRunOpen(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Reload resources when filters change
  useEffect(() => {
    fetchResources();
  }, [filters]);

  const loadData = async () => {
    await fetchResources();
    const [j, c, ss, s, n] = await Promise.all([
      apiClient.getJobs(),
      apiClient.getCollections(),
      apiClient.getSavedSearches(),
      apiClient.getSources(),
      apiClient.getNotifications()
    ]);
    setJobs(j);
    setCollections(c);
    setSavedSearches(ss);
    setSources(s);
    setNotifications(n);
  };

  const fetchResources = async () => {
    const data = await apiClient.getResources(filters);
    setResources(data.resources);
    setTotalResources(data.total);
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'github') {
      setFilters(prev => ({ ...prev, sources: ['GITHUB'], page: 1 }));
      setActiveTab('resources');
      return;
    }
    if (tab === 'telegram') {
      setFilters(prev => ({ ...prev, sources: ['TELEGRAM'], page: 1 }));
      setActiveTab('resources');
      return;
    }
    setActiveTab(tab);
  };

  const handleSearch = (q: string) => {
    setFilters(prev => ({ ...prev, search: q, page: 1 }));
  };

  const handleStartDiscovery = async (query: string, sourceTypes: SourceType[]) => {
    const newJob = await apiClient.startDiscovery({ query, sources: sourceTypes });
    setActiveJob(newJob);
    setJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const handleSaveResource = async (resource: Resource) => {
    await apiClient.saveResource(resource.id);
  };

  const handleRetryJob = async (id: string) => {
    await apiClient.retryJob(id);
    const updated = await apiClient.getJobs();
    setJobs(updated);
  };

  const handleDeleteJob = async (id: string) => {
    await apiClient.deleteJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleCreateCollection = async (name: string, description?: string, color?: string) => {
    const newCol = await apiClient.createCollection(name, description, color);
    setCollections(prev => [...prev, newCol]);
  };

  const handleCreateSavedSearch = async (search: Partial<SavedSearch>) => {
    const newSS = await apiClient.createSavedSearch(search);
    setSavedSearches(prev => [...prev, newSS]);
  };

  const handleUpdateSource = async (id: string, config: any) => {
    const updated = await apiClient.updateSource(id, config);
    setSources(prev => prev.map(s => (s.id === id ? updated : s)));
  };

  const handleDismissFirstRun = () => {
    localStorage.setItem('comicscrape_first_run', 'true');
    setFirstRunOpen(false);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onNavigate={handleNavigate}
      onSearch={handleSearch}
      resourceCount={totalResources}
      jobCount={jobs.length}
      notifications={notifications}
      onMarkNotificationRead={id => {
        apiClient.markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      }}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {/* Dynamic Page Views */}
      {activeTab === 'dashboard' && (
        <DashboardPage
          resources={resources}
          onNavigate={handleNavigate}
          onOpenDetails={setSelectedResource}
          onSaveResource={handleSaveResource}
        />
      )}

      {activeTab === 'discover' && (
        <DiscoverPage
          onStartDiscovery={handleStartDiscovery}
          onNavigateToResources={q => {
            setFilters(prev => ({ ...prev, search: q, page: 1 }));
            setActiveTab('resources');
          }}
          activeJob={activeJob}
        />
      )}

      {activeTab === 'resources' && (
        <ResourcesPage
          resources={resources}
          total={totalResources}
          filters={filters}
          onFilterChange={setFilters}
          onOpenDetails={setSelectedResource}
          onSaveResource={handleSaveResource}
          onNavigateToDiscover={() => setActiveTab('discover')}
        />
      )}

      {activeTab === 'jobs' && (
        <JobsPage
          jobs={jobs}
          onRetryJob={handleRetryJob}
          onDeleteJob={handleDeleteJob}
          onStartNewJob={() => setActiveTab('discover')}
        />
      )}

      {activeTab === 'collections' && (
        <CollectionsPage
          collections={collections}
          resources={resources}
          onCreateCollection={handleCreateCollection}
          onOpenResourceDetails={setSelectedResource}
        />
      )}

      {activeTab === 'saved-searches' && (
        <SavedSearchesPage
          searches={savedSearches}
          onCreateSavedSearch={handleCreateSavedSearch}
          onTriggerSearch={q => {
            setFilters(prev => ({ ...prev, search: q, page: 1 }));
            setActiveTab('resources');
          }}
        />
      )}

      {activeTab === 'sources' && (
        <SourcesPage
          sources={sources}
          onUpdateSource={handleUpdateSource}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsPage resources={resources} />
      )}

      {activeTab === 'admin' && (
        <AdminHealthPage />
      )}

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        onSave={handleSaveResource}
      />

      {/* First-Run Welcome Modal */}
      <Modal
        isOpen={firstRunOpen}
        onClose={handleDismissFirstRun}
        title="Welcome to ComicScrape"
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-comic-yellow text-ink-900 border-2 border-ink-800 shadow-comic flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>

          <SpeechBubble icon={<Sparkles className="w-5 h-5 text-comic-yellow" />}>
            WELCOME TO THE RESOURCE HUNT!
          </SpeechBubble>

          <p className="text-sm text-ink-700 dark:text-paper-200 leading-relaxed max-w-sm mx-auto">
            Search GitHub and your authorized Telegram sources from one centralized, deduplicated command center.
          </p>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                handleDismissFirstRun();
                setActiveTab('sources');
              }}
              className="comic-btn bg-ink-900 text-white dark:bg-ink-700 py-2.5 rounded-xl font-comic text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Connect GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleDismissFirstRun();
                setActiveTab('sources');
              }}
              className="comic-btn bg-[#229ED9] text-white py-2.5 rounded-xl font-comic text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1b86ba]"
            >
              <Send className="w-4 h-4" />
              <span>Connect Telegram</span>
            </button>

            <button
              type="button"
              onClick={handleDismissFirstRun}
              className="comic-btn bg-paper-200 dark:bg-ink-800 text-ink-800 dark:text-paper-200 py-2.5 rounded-xl text-xs font-bold hover:bg-paper-300"
            >
              Skip for now & Explore Demo Data
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
};
