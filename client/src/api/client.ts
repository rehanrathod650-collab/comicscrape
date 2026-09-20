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

// ─── localStorage persistence helpers ────────────────────────────────────────
const LS_KEYS = {
  resources: 'cs_resources',
  jobs: 'cs_jobs',
  collections: 'cs_collections',
  savedSearches: 'cs_saved_searches',
  notifications: 'cs_notifications',
  sources: 'cs_sources',
};

function lsLoad<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {}
  return fallback;
}

function lsSave<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// ─── In-memory stores backed by localStorage ─────────────────────────────────
let localResources: Resource[] = lsLoad(LS_KEYS.resources, [...DEMO_RESOURCES]);
let localJobs: ScraperJob[] = lsLoad(LS_KEYS.jobs, [...DEMO_JOBS]);
let localCollections: Collection[] = lsLoad(LS_KEYS.collections, [...DEMO_COLLECTIONS]);
let localSavedSearches: SavedSearch[] = lsLoad(LS_KEYS.savedSearches, [...DEMO_SAVED_SEARCHES]);
let localNotifications: NotificationItem[] = lsLoad(LS_KEYS.notifications, [...DEMO_NOTIFICATIONS]);
let localSources: SourceConfig[] = lsLoad(LS_KEYS.sources, [...DEMO_SOURCES]);

// ─── Discovery result templates keyed by keyword ─────────────────────────────
const DISCOVERED_RESOURCES: Record<string, Partial<Resource>[]> = {
  default: [
    {
      sourceType: 'GITHUB',
      resourceType: 'REPOSITORY',
      title: 'Awesome Developer Tools Collection',
      description: 'Curated list of developer tools, libraries, and resources discovered from community recommendations.',
      url: 'https://github.com/sindresorhus/awesome',
      canonicalUrl: 'https://github.com/sindresorhus/awesome',
      author: 'sindresorhus',
      owner: 'sindresorhus',
      repository: 'awesome',
      language: 'Markdown',
      license: 'CC0-1.0',
      stars: 324000,
      forks: 28000,
      importanceScore: 99.8,
      tags: ['awesome', 'lists', 'resources', 'community'],
      readmePreview: '# Awesome\n\nA curated list of awesome things related to programming and development.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'TUTORIAL',
      title: 'Full-Stack Web Dev Roadmap 2026',
      description: 'Interactive learning roadmap covering frontend, backend, DevOps, and cloud skills for modern web development.',
      url: 'https://github.com/kamranahmedse/developer-roadmap',
      canonicalUrl: 'https://github.com/kamranahmedse/developer-roadmap',
      author: 'kamranahmedse',
      owner: 'kamranahmedse',
      repository: 'developer-roadmap',
      language: 'TypeScript',
      license: 'MIT',
      stars: 298000,
      forks: 40100,
      importanceScore: 99.5,
      tags: ['roadmap', 'learning', 'web-development', 'career', 'frontend', 'backend'],
      readmePreview: '# Developer Roadmap\n\nRoadmaps, guides and other educational content to help developers grow in their career.'
    },
    {
      sourceType: 'TELEGRAM',
      resourceType: 'ARTICLE',
      title: 'System Design Interview Mega Guide',
      description: 'Complete system design interview preparation guide with real case studies from FAANG engineers. Covers distributed systems, databases, caching, and more.',
      url: 'https://t.me/system_design_hub/482',
      canonicalUrl: 'https://t.me/system_design_hub/482',
      author: 'system_design_hub',
      channel: '@system_design_hub',
      stars: 0,
      forks: 0,
      importanceScore: 91.2,
      tags: ['system-design', 'interview', 'distributed-systems', 'engineering'],
      readmePreview: 'Deep dive into designing scalable systems with real-world examples from top tech companies.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'LIBRARY',
      title: 'Next.js 15 Production Starter Kit',
      description: 'Battle-tested Next.js 15 starter with App Router, Auth.js v5, Prisma ORM, shadcn/ui components, and full TypeScript support.',
      url: 'https://github.com/mickasmt/next-saas-stripe-starter',
      canonicalUrl: 'https://github.com/mickasmt/next-saas-stripe-starter',
      author: 'mickasmt',
      owner: 'mickasmt',
      repository: 'next-saas-stripe-starter',
      language: 'TypeScript',
      license: 'MIT',
      stars: 7800,
      forks: 1200,
      importanceScore: 96.0,
      tags: ['nextjs', 'react', 'saas', 'typescript', 'prisma', 'shadcn'],
      readmePreview: '# Next.js SaaS Starter\n\nAn open-source SaaS starter built with everything you need to build your SaaS.'
    }
  ],
  python: [
    {
      sourceType: 'GITHUB',
      resourceType: 'REPOSITORY',
      title: 'Python Design Patterns & Best Practices',
      description: 'Comprehensive collection of Python design patterns (Gang of Four + Python-specific) with real-world examples and performance benchmarks.',
      url: 'https://github.com/faif/python-patterns',
      canonicalUrl: 'https://github.com/faif/python-patterns',
      author: 'faif',
      owner: 'faif',
      repository: 'python-patterns',
      language: 'Python',
      license: 'MIT',
      stars: 39800,
      forks: 6700,
      importanceScore: 97.1,
      tags: ['python', 'design-patterns', 'best-practices', 'oop'],
      readmePreview: '# Python Patterns\n\nA collection of design patterns and idioms in Python.'
    },
    {
      sourceType: 'TELEGRAM',
      resourceType: 'PDF',
      title: 'Fluent Python 2nd Edition - Key Chapters',
      description: 'Selected chapters from Fluent Python covering data model, generators, coroutines, and metaprogramming.',
      url: 'https://t.me/python_ebooks/1291',
      canonicalUrl: 'https://t.me/python_ebooks/1291',
      author: 'python_ebooks',
      channel: '@python_ebooks',
      fileName: 'fluent_python_excerpts.pdf',
      fileExtension: '.pdf',
      stars: 0,
      forks: 0,
      importanceScore: 93.4,
      tags: ['python', 'book', 'pdf', 'advanced-python', 'coroutines'],
      readmePreview: 'Key excerpts from the definitive advanced Python programming book by Luciano Ramalho.'
    }
  ],
  javascript: [
    {
      sourceType: 'GITHUB',
      resourceType: 'REPOSITORY',
      title: 'You Don\'t Know JS (Yet) - Book Series',
      description: 'Full YDKJS book series: Scope & Closures, this & Object Prototypes, Async & Performance, and ES6 & Beyond.',
      url: 'https://github.com/getify/You-Dont-Know-JS',
      canonicalUrl: 'https://github.com/getify/You-Dont-Know-JS',
      author: 'getify',
      owner: 'getify',
      repository: 'You-Dont-Know-JS',
      language: 'JavaScript',
      license: 'CC-BY-NC-ND-4.0',
      stars: 178000,
      forks: 33500,
      importanceScore: 99.7,
      tags: ['javascript', 'book', 'ydkjs', 'learning', 'fundamentals'],
      readmePreview: '# You Don\'t Know JS Yet\n\nA series of books diving deep into the core mechanisms of the JavaScript language.'
    }
  ],
  react: [
    {
      sourceType: 'GITHUB',
      resourceType: 'CODE',
      title: 'React 19 Patterns & Modern Hooks Cookbook',
      description: 'Production-proven collection of React 19 patterns, custom hooks, compound components, and server component patterns.',
      url: 'https://github.com/alan2207/bulletproof-react',
      canonicalUrl: 'https://github.com/alan2207/bulletproof-react',
      author: 'alan2207',
      owner: 'alan2207',
      repository: 'bulletproof-react',
      language: 'TypeScript',
      license: 'MIT',
      stars: 27400,
      forks: 2900,
      importanceScore: 98.6,
      tags: ['react', 'patterns', 'hooks', 'architecture', 'typescript'],
      readmePreview: '# Bulletproof React\n\nA simple, scalable, and powerful architecture for building production-ready React applications.'
    }
  ],
  ai: [
    {
      sourceType: 'GITHUB',
      resourceType: 'LIBRARY',
      title: 'LangChain.js — LLM Application Framework',
      description: 'Build LLM-powered applications with chains, agents, memory, and tool integration in TypeScript/JavaScript.',
      url: 'https://github.com/langchain-ai/langchainjs',
      canonicalUrl: 'https://github.com/langchain-ai/langchainjs',
      author: 'langchain-ai',
      owner: 'langchain-ai',
      repository: 'langchainjs',
      language: 'TypeScript',
      license: 'MIT',
      stars: 13200,
      forks: 2300,
      importanceScore: 97.9,
      tags: ['langchain', 'ai', 'llm', 'typescript', 'gpt', 'agents'],
      readmePreview: '# LangChain.js\n\nBuilding applications with LLMs through composability.'
    },
    {
      sourceType: 'TELEGRAM',
      resourceType: 'TUTORIAL',
      title: 'Prompt Engineering Mastery Guide',
      description: 'Complete guide to writing effective prompts for GPT-4o, Claude, and Gemini — covering chain-of-thought, few-shot, and RAG patterns.',
      url: 'https://t.me/ai_ml_tutorials/891',
      canonicalUrl: 'https://t.me/ai_ml_tutorials/891',
      author: 'ai_ml_tutorials',
      channel: '@ai_ml_tutorials',
      stars: 0,
      forks: 0,
      importanceScore: 94.8,
      tags: ['ai', 'prompt-engineering', 'gpt', 'llm', 'tutorial'],
      readmePreview: 'Step-by-step guide to mastering prompt engineering for modern LLMs.'
    }
  ],
  rust: [
    {
      sourceType: 'GITHUB',
      resourceType: 'EBOOK',
      title: 'The Rust Programming Language (Book)',
      description: 'Official Rust language book - ownership, borrowing, lifetimes, traits, async, and systems programming in Rust.',
      url: 'https://github.com/rust-lang/book',
      canonicalUrl: 'https://github.com/rust-lang/book',
      author: 'rust-lang',
      owner: 'rust-lang',
      repository: 'book',
      language: 'Rust',
      license: 'MIT',
      stars: 15600,
      forks: 3200,
      importanceScore: 99.3,
      tags: ['rust', 'book', 'systems-programming', 'official', 'beginner'],
      readmePreview: '# The Rust Programming Language\n\nOfficial guide to learning Rust, aka "the book".'
    }
  ],
  docker: [
    {
      sourceType: 'GITHUB',
      resourceType: 'CODE',
      title: 'Docker Production Deployment Blueprints',
      description: 'Battle-tested Docker Compose templates for deploying web apps, databases, monitoring stacks, and microservices in production.',
      url: 'https://github.com/docker/awesome-compose',
      canonicalUrl: 'https://github.com/docker/awesome-compose',
      author: 'docker',
      owner: 'docker',
      repository: 'awesome-compose',
      language: 'Dockerfile',
      license: 'Apache-2.0',
      stars: 34200,
      forks: 6100,
      importanceScore: 96.7,
      tags: ['docker', 'compose', 'containers', 'devops', 'deployment'],
      readmePreview: '# Awesome Compose\n\nA curated list of Docker Compose samples.'
    }
  ]
};

/** Pick discovered resources for a given query */
function pickDiscoveredResources(query: string, sources: ('GITHUB' | 'TELEGRAM')[]): Partial<Resource>[] {
  const q = query.toLowerCase();
  let pool: Partial<Resource>[] = [];

  for (const [keyword, items] of Object.entries(DISCOVERED_RESOURCES)) {
    if (keyword !== 'default' && q.includes(keyword)) {
      pool.push(...items);
    }
  }

  // Always mix in some default results
  pool.push(...DISCOVERED_RESOURCES.default);

  // Filter by requested sources
  pool = pool.filter(r => sources.includes(r.sourceType as 'GITHUB' | 'TELEGRAM'));

  // Deduplicate by URL against existing resources
  const existingUrls = new Set(localResources.map(r => r.url));
  pool = pool.filter(r => r.url && !existingUrls.has(r.url!));

  return pool.slice(0, 6);
}

/** Create full Resource objects from partials */
function buildResources(partials: Partial<Resource>[], query: string): Resource[] {
  return partials.map((p, i) => ({
    id: `res-hunt-${Date.now()}-${i}`,
    sourceType: p.sourceType || 'GITHUB',
    externalId: `ext-${Date.now()}-${i}`,
    title: p.title || `Resource for "${query}"`,
    description: p.description || `Discovered resource matching "${query}"`,
    resourceType: p.resourceType || 'REPOSITORY',
    url: p.url || '#',
    canonicalUrl: p.canonicalUrl || p.url || '#',
    author: p.author,
    owner: p.owner,
    repository: p.repository,
    channel: p.channel,
    fileName: p.fileName,
    fileExtension: p.fileExtension,
    mimeType: p.mimeType,
    fileSize: p.fileSize,
    language: p.language,
    license: p.license,
    stars: p.stars ?? 0,
    forks: p.forks ?? 0,
    publishedAt: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contentHash: `hash-${Date.now()}-${i}`,
    dedupeScore: 0,
    isDuplicate: false,
    isDemo: false,
    importanceScore: p.importanceScore ?? Math.round(70 + Math.random() * 25),
    tags: p.tags || [query.toLowerCase()],
    readmePreview: p.readmePreview,
  } as Resource));
}

/** Simulate progressive job completion in-memory & persist to localStorage */
function simulateJobCompletion(jobId: string, query: string, sources: ('GITHUB' | 'TELEGRAM')[]) {
  const steps = [
    { delay: 1200, progress: 30, task: 'Querying GitHub API...' },
    { delay: 2400, progress: 55, task: 'Scanning Telegram channels...' },
    { delay: 3600, progress: 75, task: 'Normalizing and deduplicating results...' },
    { delay: 4800, progress: 90, task: 'Classifying and scoring resources...' },
    { delay: 6000, progress: 100, task: 'Hunt complete!' },
  ];

  const discovered = pickDiscoveredResources(query, sources);
  const newResources = buildResources(discovered, query);

  steps.forEach(({ delay, progress, task }, idx) => {
    setTimeout(() => {
      const job = localJobs.find(j => j.id === jobId);
      if (!job || job.status === 'CANCELLED') return;

      const isLast = idx === steps.length - 1;

      job.progress = progress;
      job.currentTask = task;
      job.status = isLast ? 'COMPLETED' : 'RUNNING';
      if (isLast) {
        job.completedAt = new Date().toISOString();
        job.resourcesFound = newResources.length;
        job.duplicatesFound = 0;
        job.logs.push({
          timestamp: new Date().toLocaleTimeString(),
          step: 'Complete',
          message: `Hunt finished! Found ${newResources.length} new resources for "${query}".`,
          type: 'success'
        });

        // Inject new resources into the store
        localResources = [...newResources, ...localResources];
        lsSave(LS_KEYS.resources, localResources);

        // Add a notification
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: 'Hunt Complete!',
          message: `Found ${newResources.length} new resources for "${query}".`,
          type: 'SUCCESS',
          read: false,
          createdAt: new Date().toISOString()
        };
        localNotifications = [notif, ...localNotifications];
        lsSave(LS_KEYS.notifications, localNotifications);
      } else {
        job.logs.push({
          timestamp: new Date().toLocaleTimeString(),
          step: task.split('...')[0].trim(),
          message: task,
          type: 'info'
        });
      }

      lsSave(LS_KEYS.jobs, localJobs);
    }, delay);
  });
}

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

    const jobId = `job-${Date.now()}`;
    const newJob: ScraperJob = {
      id: jobId,
      type: 'MANUAL_DISCOVERY',
      query: data.query,
      sources: data.sources,
      status: 'RUNNING',
      progress: 10,
      currentTask: `Initiating hunt for "${data.query}"...`,
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
    lsSave(LS_KEYS.jobs, localJobs);

    // Simulate progressive completion and inject discovered resources
    simulateJobCompletion(jobId, data.query, data.sources);

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
      lsSave(LS_KEYS.jobs, localJobs);
    }
    return { success: true };
  },

  async deleteJob(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    localJobs = localJobs.filter(j => j.id !== id);
    lsSave(LS_KEYS.jobs, localJobs);
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
    lsSave(LS_KEYS.collections, localCollections);
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
      lsSave(LS_KEYS.sources, localSources);
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
    lsSave(LS_KEYS.savedSearches, localSavedSearches);
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
    if (n) {
      n.read = true;
      lsSave(LS_KEYS.notifications, localNotifications);
    }
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
        REPOSITORY: localResources.filter(r => r.resourceType === 'REPOSITORY').length,
        PDF: localResources.filter(r => r.resourceType === 'PDF').length,
        CODE: localResources.filter(r => r.resourceType === 'CODE').length,
        DOCUMENTATION: localResources.filter(r => r.resourceType === 'DOCUMENTATION').length,
        TEMPLATE: localResources.filter(r => r.resourceType === 'TEMPLATE').length,
        TOOL: localResources.filter(r => r.resourceType === 'TOOL').length,
        EBOOK: localResources.filter(r => r.resourceType === 'EBOOK').length,
        TUTORIAL: localResources.filter(r => r.resourceType === 'TUTORIAL').length,
        ZIP: localResources.filter(r => r.resourceType === 'ZIP').length,
        DATASET: localResources.filter(r => r.resourceType === 'DATASET').length,
        LINK: localResources.filter(r => r.resourceType === 'LINK').length,
        ARTICLE: localResources.filter(r => r.resourceType === 'ARTICLE').length
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
  },

  // Utility: reset all local data back to demo defaults (useful for testing)
  resetLocalData(): void {
    localResources = [...DEMO_RESOURCES];
    localJobs = [...DEMO_JOBS];
    localCollections = [...DEMO_COLLECTIONS];
    localSavedSearches = [...DEMO_SAVED_SEARCHES];
    localNotifications = [...DEMO_NOTIFICATIONS];
    localSources = [...DEMO_SOURCES];
    lsSave(LS_KEYS.resources, localResources);
    lsSave(LS_KEYS.jobs, localJobs);
    lsSave(LS_KEYS.collections, localCollections);
    lsSave(LS_KEYS.savedSearches, localSavedSearches);
    lsSave(LS_KEYS.notifications, localNotifications);
    lsSave(LS_KEYS.sources, localSources);
  }
};
