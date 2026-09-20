export type SourceType = 'GITHUB' | 'TELEGRAM';

export type ResourceType =
  | 'REPOSITORY'
  | 'CODE'
  | 'DOCUMENTATION'
  | 'TUTORIAL'
  | 'ARTICLE'
  | 'PDF'
  | 'EBOOK'
  | 'COURSE'
  | 'VIDEO'
  | 'DATASET'
  | 'TOOL'
  | 'LIBRARY'
  | 'TEMPLATE'
  | 'ZIP'
  | 'IMAGE'
  | 'LINK'
  | 'FILE'
  | 'OTHER';

export interface Resource {
  id: string;
  sourceType: SourceType;
  sourceId?: string;
  externalId: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  url: string;
  canonicalUrl: string;
  author?: string;
  owner?: string;
  repository?: string;
  channel?: string;
  fileName?: string;
  fileExtension?: string;
  mimeType?: string;
  fileSize?: number;
  language?: string;
  license?: string;
  stars: number;
  forks: number;
  publishedAt?: string;
  discoveredAt: string;
  updatedAt: string;
  contentHash: string;
  dedupeScore: number;
  duplicateOfId?: string;
  isDuplicate: boolean;
  isDemo: boolean;
  importanceScore: number;
  tags: string[];
  metadata?: Record<string, any>;
  readmePreview?: string;
}

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type JobType =
  | 'MANUAL_DISCOVERY'
  | 'SCHEDULED_DISCOVERY'
  | 'SOURCE_SYNC'
  | 'REINDEX'
  | 'DEDUPLICATION'
  | 'METADATA_REFRESH';

export interface ScraperJob {
  id: string;
  type: JobType;
  query: string;
  sources: SourceType[];
  status: JobStatus;
  progress: number;
  currentTask: string;
  resourcesFound: number;
  duplicatesFound: number;
  error?: string;
  logs: { timestamp: string; message: string; step: string; type?: 'info' | 'success' | 'warn' | 'error' }[];
  schedule?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  resourceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  sources: SourceType[];
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
  notifyOnNew: boolean;
  lastRunAt?: string;
  createdAt: string;
}

export interface SourceConfig {
  id: string;
  type: SourceType;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncAt?: string;
  resourceCount: number;
  lastError?: string;
  config?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DiscoveryFilters {
  search?: string;
  sources?: SourceType[];
  resourceTypes?: ResourceType[];
  languages?: string[];
  dateRange?: 'today' | 'week' | 'month' | 'all';
  minStars?: number;
  fileTypes?: string[];
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'stars' | 'forks' | 'discovered' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
