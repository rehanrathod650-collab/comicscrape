import {
  Resource,
  ScraperJob,
  Collection,
  SavedSearch,
  SourceConfig,
  NotificationItem,
  DiscoveryFilters
} from '../types';
import {
  DEMO_RESOURCES,
  DEMO_COLLECTIONS,
  DEMO_JOBS,
  DEMO_SOURCES,
  DEMO_SAVED_SEARCHES,
  DEMO_NOTIFICATIONS
} from './demoData';

const API_BASE = '/api';

// In-memory local fallback store for seamless interactive demo operation
let localResources: Resource[] = [...DEMO_RESOURCES];
let localJobs: ScraperJob[] = [...DEMO_JOBS];
let localCollections: Collection[] = [...DEMO_COLLECTIONS];
let localSavedSearches: SavedSearch[] = [...DEMO_SAVED_SEARCHES];
let localNotifications: NotificationItem[] = [...DEMO_NOTIFICATIONS];
let localSources: SourceConfig[] = [...DEMO_SOURCES];

export const apiClient = {
  // Resources
  async getResources(filters?: DiscoveryFilters): Promise<{ resources: Resource[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sources?.length) params.append('sources', filters.sources.join(','));
      if (filters?.resourceTypes?.length) params.append('resourceTypes', filters.resourceTypes.join(','));
      if (filters?.languages?.length) params.append('languages', filters.languages.join(','));
      if (filters?.fileTypes?.length) params.append('fileTypes', filters.fileTypes.join(','));
      if (filters?.minStars) params.append('minStars', filters.minStars.toString());
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local memory store
    }

    // Local filter implementation
    let result = [...localResources];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        (r.repository && r.repository.toLowerCase().includes(q)) ||
        (r.channel && r.channel.toLowerCase().includes(q)) ||
        (r.author && r.author.toLowerCase().includes(q))
      );
    }

    if (filters?.sources && filters.sources.length > 0) {
      result = result.filter(r => filters.sources!.includes(r.sourceType));
    }

    if (filters?.resourceTypes && filters.resourceTypes.length > 0) {
      result = result.filter(r => filters.resourceTypes!.includes(r.resourceType));
    }

    if (filters?.languages && filters.languages.length > 0) {
      result = result.filter(r => r.language && filters.languages!.includes(r.language));
    }

    if (filters?.fileTypes && filters.fileTypes.length > 0) {
      result = result.filter(r => r.fileExtension && filters.fileTypes!.includes(r.fileExtension.toLowerCase()));
    }

    if (filters?.minStars && filters.minStars > 0) {
      result = result.filter(r => r.stars >= filters.minStars!);
    }

    // Sorting
    const sortField = filters?.sortBy || 'relevance';
    const isAsc = filters?.sortOrder === 'asc';

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'stars':
          cmp = b.stars - a.stars;
          break;
        case 'forks':
          cmp = b.forks - a.forks;
          break;
        case 'newest':
          cmp = new Date(b.publishedAt || b.discoveredAt).getTime() - new Date(a.publishedAt || a.discoveredAt).getTime();
          break;
        case 'oldest':
          cmp = new Date(a.publishedAt || a.discoveredAt).getTime() - new Date(b.publishedAt || b.discoveredAt).getTime();
          break;
        case 'alphabetical':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'relevance':
        default:
          cmp = b.importanceScore - a.importanceScore;
          break;
      }
      return isAsc ? -cmp : cmp;
    });

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return {
      resources: paginated,
      total: result.length,
      page,
      totalPages: Math.ceil(result.length / limit)
    };
  },

  async getResourceById(id: string): Promise<Resource | null> {
    try {
      const res = await fetch(`${API_BASE}/resources/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    return localResources.find(r => r.id === id) || null;
  },

  async saveResource(id: string, collectionId?: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/resources/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId })
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: true };
  },

  // Discovery & Jobs
  async startDiscovery(data: { query: string; sources: ('GITHUB' | 'TELEGRAM')[]; filters?: any }): Promise<ScraperJob> {
    try {
      const res = await fetch(`${API_BASE}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}

    const newJob: ScraperJob = {
      id: `job-${Date.now()}`,
      type: 'MANUAL_DISCOVERY',
      query: data.query,
      sources: data.sources,
      status: 'RUNNING',
      progress: 15,
      currentTask: `Connecting to ${data.sources.join(' & ')} collectors for "${data.query}"...`,
      resourcesFound: 0,
      duplicatesFound: 0,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      logs: [
        { timestamp: new Date().toLocaleTimeString(), step: 'Start', message: `Initiated hunt for "${data.query}"`, type: 'info' },
        { timestamp: new Date().toLocaleTimeString(), step: 'Connecting', message: `Dispatching requests to collectors...`, type: 'info' }
      ]
    };

    localJobs.unshift(newJob);
    return newJob;
  },

  async getJobs(): Promise<ScraperJob[]> {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      if (res.ok) return await res.json();
    } catch {}
    return localJobs;
  },

  async getJobById(id: string): Promise<ScraperJob | null> {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    return localJobs.find(j => j.id === id) || null;
  },

  async retryJob(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}/retry`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    const job = localJobs.find(j => j.id === id);
    if (job) {
      job.status = 'RUNNING';
      job.progress = 20;
    }
    return { success: true };
  },

  async deleteJob(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    localJobs = localJobs.filter(j => j.id !== id);
    return { success: true };
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    try {
      const res = await fetch(`${API_BASE}/collections`);
      if (res.ok) return await res.json();
    } catch {}
    return localCollections;
  },

  async createCollection(name: string, description?: string, color?: string): Promise<Collection> {
    try {
      const res = await fetch(`${API_BASE}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color })
      });
      if (res.ok) return await res.json();
    } catch {}
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      color: color || '#facc15',
      icon: 'Folder',
      resourceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localCollections.push(newCol);
    return newCol;
  },

  // Sources
  async getSources(): Promise<SourceConfig[]> {
    try {
      const res = await fetch(`${API_BASE}/sources`);
      if (res.ok) return await res.json();
    } catch {}
    return localSources;
  },

  async updateSource(id: string, config: any): Promise<SourceConfig> {
    try {
      const res = await fetch(`${API_BASE}/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) return await res.json();
    } catch {}
    const src = localSources.find(s => s.id === id);
    if (src) {
      src.config = { ...src.config, ...config };
      src.status = 'CONNECTED';
      src.lastSyncAt = new Date().toISOString();
      return src;
    }
    throw new Error('Source not found');
  },

  // Saved Searches
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const res = await fetch(`${API_BASE}/saved-searches`);
      if (res.ok) return await res.json();
    } catch {}
    return localSavedSearches;
  },

  async createSavedSearch(search: Partial<SavedSearch>): Promise<SavedSearch> {
    try {
      const res = await fetch(`${API_BASE}/saved-searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search)
      });
      if (res.ok) return await res.json();
    } catch {}
    const newSearch: SavedSearch = {
      id: `ss-${Date.now()}`,
      query: search.query || '',
      sources: search.sources || ['GITHUB', 'TELEGRAM'],
      frequency: search.frequency || 'DAILY',
      notifyOnNew: search.notifyOnNew ?? true,
      createdAt: new Date().toISOString()
    };
    localSavedSearches.push(newSearch);
    return newSearch;
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) return await res.json();
    } catch {}
    return localNotifications;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    } catch {}
    const n = localNotifications.find(item => item.id === id);
    if (n) n.read = true;
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      totalResources: localResources.length,
      githubCount: localResources.filter(r => r.sourceType === 'GITHUB').length,
      telegramCount: localResources.filter(r => r.sourceType === 'TELEGRAM').length,
      documentCount: localResources.filter(r => ['PDF', 'EBOOK', 'DOCUMENTATION'].includes(r.resourceType)).length,
      linkCount: localResources.filter(r => r.resourceType === 'LINK').length,
      duplicatePercentage: 12.4,
      successRate: 98.2,
      byType: {
        REPOSITORY: 5,
        PDF: 5,
        CODE: 2,
        DOCUMENTATION: 1,
        TEMPLATE: 1,
        TOOL: 1,
        EBOOK: 2,
        TUTORIAL: 2,
        ZIP: 1,
        DATASET: 1,
        LINK: 1,
        ARTICLE: 1
      },
      discoveriesOverTime: [
        { date: 'Mon', count: 18 },
        { date: 'Tue', count: 32 },
        { date: 'Wed', count: 45 },
        { date: 'Thu', count: 28 },
        { date: 'Fri', count: 64 },
        { date: 'Sat', count: 52 },
        { date: 'Sun', count: 71 }
      ]
    };
  }
};
