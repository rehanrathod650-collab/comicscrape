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
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      // If cached resources contain stale fake demo URLs, invalidate and use fresh real catalog
      if (key === LS_KEYS.resources && Array.isArray(parsed)) {
        const hasStaleDemo = (parsed as any[]).some(
          r => r?.isDemo === true || (r?.url && (r.url.includes('the-comic-dev') || r.url.includes('frontend-heroes') || r.url.includes('mindcraft') || r.url.includes('rust-sec') || r.url.includes('cloud-architects')))
        );
        if (hasStaleDemo) {
          lsSave(key, fallback);
          return fallback;
        }
      }
      return parsed;
    }
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
      title: 'sindresorhus/awesome',
      description: 'Curated list of awesome developer tools, libraries, and resources discovered from community recommendations.',
      url: 'https://github.com/sindresorhus/awesome',
      canonicalUrl: 'https://github.com/sindresorhus/awesome',
      author: 'sindresorhus',
      owner: 'sindresorhus',
      repository: 'awesome',
      language: 'Markdown',
      license: 'CC0-1.0',
      stars: 345000,
      forks: 29000,
      importanceScore: 99.8,
      tags: ['awesome', 'lists', 'resources', 'community'],
      readmePreview: '# Awesome\n\nA curated list of awesome things related to programming and development.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'TUTORIAL',
      title: 'kamranahmedse/developer-roadmap',
      description: 'Interactive learning roadmap covering frontend, backend, DevOps, and cloud skills for modern web development.',
      url: 'https://github.com/kamranahmedse/developer-roadmap',
      canonicalUrl: 'https://github.com/kamranahmedse/developer-roadmap',
      author: 'kamranahmedse',
      owner: 'kamranahmedse',
      repository: 'developer-roadmap',
      language: 'TypeScript',
      license: 'CC-BY-NC-SA-4.0',
      stars: 310000,
      forks: 41200,
      importanceScore: 99.5,
      tags: ['roadmap', 'learning', 'web-development', 'career', 'frontend', 'backend'],
      readmePreview: '# Developer Roadmap\n\nRoadmaps, guides and other educational content to help developers grow in their career.'
    },
    {
      sourceType: 'TELEGRAM',
      resourceType: 'ARTICLE',
      title: 'Bookmarkable by Design: URL-Driven State in Web Apps',
      description: 'Deep dive into eliminating hidden component states by serializing UI filters, pagination, and modals into query parameters.',
      url: 'https://t.me/thedevs/1150',
      canonicalUrl: 'https://t.me/thedevs/1150',
      author: 'thedevs',
      channel: '@thedevs',
      stars: 0,
      forks: 0,
      importanceScore: 92.4,
      tags: ['frontend', 'web-dev', 'article', 'architecture', 'javascript'],
      readmePreview: 'Deep dive into designing scalable systems and URL-driven state.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'LIBRARY',
      title: 'vercel/next.js',
      description: 'The React Framework for the Web with App Router, Server Components, and full TypeScript support.',
      url: 'https://github.com/vercel/next.js',
      canonicalUrl: 'https://github.com/vercel/next.js',
      author: 'vercel',
      owner: 'vercel',
      repository: 'next.js',
      language: 'TypeScript',
      license: 'MIT',
      stars: 129000,
      forks: 27000,
      importanceScore: 99.4,
      tags: ['nextjs', 'react', 'typescript', 'fullstack', 'ssr'],
      readmePreview: '# Next.js\n\nThe React framework for modern full-stack web applications.'
    }
  ],
  python: [
    {
      sourceType: 'GITHUB',
      resourceType: 'LIBRARY',
      title: 'tiangolo/fastapi',
      description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production with automatic OpenAPI documentation.',
      url: 'https://github.com/tiangolo/fastapi',
      canonicalUrl: 'https://github.com/tiangolo/fastapi',
      author: 'tiangolo',
      owner: 'tiangolo',
      repository: 'fastapi',
      language: 'Python',
      license: 'MIT',
      stars: 79200,
      forks: 6400,
      importanceScore: 98.8,
      tags: ['fastapi', 'python', 'api', 'async', 'pydantic', 'rest'],
      readmePreview: '# FastAPI\n\nHigh-performance web API framework for Python.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'TOOL',
      title: 'astral-sh/uv',
      description: 'An extremely fast Python package and project manager, written in Rust. Drop-in replacement for pip and virtualenv.',
      url: 'https://github.com/astral-sh/uv',
      canonicalUrl: 'https://github.com/astral-sh/uv',
      author: 'astral-sh',
      owner: 'astral-sh',
      repository: 'uv',
      language: 'Rust',
      license: 'Apache-2.0',
      stars: 43200,
      forks: 1300,
      importanceScore: 97.5,
      tags: ['uv', 'python', 'rust', 'packaging', 'pip'],
      readmePreview: '# uv\n\nFast Python package manager.'
    },
    {
      sourceType: 'TELEGRAM',
      resourceType: 'CODE',
      title: 'Clearcam: Real-Time Computer Vision & Smart Monitoring with Python',
      description: 'Python script utility utilizing OpenCV, YOLO object detection, and local RTSP streaming for home security and smart automation.',
      url: 'https://t.me/python2day/8155',
      canonicalUrl: 'https://t.me/python2day/8155',
      author: 'python2day',
      channel: '@python2day',
      stars: 0,
      forks: 0,
      importanceScore: 92.8,
      tags: ['python', 'opencv', 'computer-vision', 'automation', 'yolo'],
      readmePreview: 'Python computer vision automation using OpenCV and YOLO.'
    }
  ],
  javascript: [
    {
      sourceType: 'GITHUB',
      resourceType: 'EBOOK',
      title: 'getify/You-Dont-Know-JS',
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
      importanceScore: 99.6,
      tags: ['javascript', 'book', 'ydkjs', 'learning', 'fundamentals'],
      readmePreview: '# You Don\'t Know JS Yet\n\nA series of books diving deep into the core mechanisms of the JavaScript language.'
    }
  ],
  react: [
    {
      sourceType: 'GITHUB',
      resourceType: 'LIBRARY',
      title: 'facebook/react',
      description: 'The library for web and native user interfaces. Build user interfaces out of declarative components in JavaScript and TypeScript.',
      url: 'https://github.com/facebook/react',
      canonicalUrl: 'https://github.com/facebook/react',
      author: 'facebook',
      owner: 'facebook',
      repository: 'react',
      language: 'JavaScript',
      license: 'MIT',
      stars: 231000,
      forks: 46000,
      importanceScore: 99.9,
      tags: ['react', 'javascript', 'ui', 'frontend', 'components'],
      readmePreview: '# React\n\nDeclarative, component-based library for building user interfaces.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'CODE',
      title: 'shadcn-ui/ui',
      description: 'Beautifully designed components that you can copy and paste into your apps. Accessible, customizable, open source.',
      url: 'https://github.com/shadcn-ui/ui',
      canonicalUrl: 'https://github.com/shadcn-ui/ui',
      author: 'shadcn-ui',
      owner: 'shadcn-ui',
      repository: 'ui',
      language: 'TypeScript',
      license: 'MIT',
      stars: 76000,
      forks: 6900,
      importanceScore: 98.6,
      tags: ['shadcn', 'ui', 'components', 'radix-ui', 'tailwind', 'react'],
      readmePreview: '# shadcn/ui\n\nAccessible and customizable components.'
    }
  ],
  ai: [
    {
      sourceType: 'GITHUB',
      resourceType: 'LIBRARY',
      title: 'langchain-ai/langchain',
      description: '🦜🔗 Build context-aware reasoning applications with LangChain. Flexible abstractions and AI toolkit for LLM workflows.',
      url: 'https://github.com/langchain-ai/langchain',
      canonicalUrl: 'https://github.com/langchain-ai/langchain',
      author: 'langchain-ai',
      owner: 'langchain-ai',
      repository: 'langchain',
      language: 'Python',
      license: 'MIT',
      stars: 98500,
      forks: 15800,
      importanceScore: 99.2,
      tags: ['langchain', 'ai', 'llm', 'python', 'agents', 'rag'],
      readmePreview: '# LangChain\n\nFramework for developing applications powered by LLMs.'
    },
    {
      sourceType: 'GITHUB',
      resourceType: 'TOOL',
      title: 'AUTOMATIC1111/stable-diffusion-webui',
      description: 'Stable Diffusion web UI for generative image models with browser interface based on Gradio.',
      url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
      canonicalUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
      author: 'AUTOMATIC1111',
      owner: 'AUTOMATIC1111',
      repository: 'stable-diffusion-webui',
      language: 'Python',
      license: 'AGPL-3.0',
      stars: 142000,
      forks: 27500,
      importanceScore: 99.1,
      tags: ['ai', 'stable-diffusion', 'image-generation', 'gradio', 'python'],
      readmePreview: '# Stable Diffusion WebUI\n\nA browser interface based on Gradio for Stable Diffusion.'
    }
  ],
  rust: [
    {
      sourceType: 'GITHUB',
      resourceType: 'REPOSITORY',
      title: 'rust-lang/rust',
      description: 'Empowering everyone to build reliable and efficient software. The Rust programming language official repository.',
      url: 'https://github.com/rust-lang/rust',
      canonicalUrl: 'https://github.com/rust-lang/rust',
      author: 'rust-lang',
      owner: 'rust-lang',
      repository: 'rust',
      language: 'Rust',
      license: 'MIT',
      stars: 101000,
      forks: 13200,
      importanceScore: 99.5,
      tags: ['rust', 'compiler', 'systems-programming', 'language'],
      readmePreview: '# The Rust Programming Language\n\nOfficial source repository for Rust.'
    }
  ],
  docker: [
    {
      sourceType: 'GITHUB',
      resourceType: 'CODE',
      title: 'docker/awesome-compose',
      description: 'Awesome Docker Compose samples. Curated collection of battle-tested Docker Compose recipes.',
      url: 'https://github.com/docker/awesome-compose',
      canonicalUrl: 'https://github.com/docker/awesome-compose',
      author: 'docker',
      owner: 'docker',
      repository: 'awesome-compose',
      language: 'Dockerfile',
      license: 'Apache-2.0',
      stars: 35400,
      forks: 6400,
      importanceScore: 96.8,
      tags: ['docker', 'compose', 'containers', 'devops', 'templates'],
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
