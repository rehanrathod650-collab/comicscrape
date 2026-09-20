import { prisma } from '../db/client';

export interface SearchQueryParams {
  search?: string;
  sources?: string[];
  resourceTypes?: string[];
  languages?: string[];
  fileTypes?: string[];
  minStars?: number;
  dateRange?: string;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'stars' | 'forks' | 'discovered' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class SearchService {
  /**
   * Comprehensive search & filtering across SQLite / PostgreSQL with Prisma
   */
  static async queryResources(params: SearchQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Source Filter
    if (params.sources && params.sources.length > 0) {
      where.sourceType = { in: params.sources };
    }

    // Resource Type Filter
    if (params.resourceTypes && params.resourceTypes.length > 0) {
      where.resourceType = { in: params.resourceTypes };
    }

    // Language Filter
    if (params.languages && params.languages.length > 0) {
      where.language = { in: params.languages };
    }

    // File Format Filter
    if (params.fileTypes && params.fileTypes.length > 0) {
      where.fileExtension = { in: params.fileTypes.map(f => f.toLowerCase()) };
    }

    // Min Stars Filter
    if (params.minStars && params.minStars > 0) {
      where.stars = { gte: params.minStars };
    }

    // Date Range Filter
    if (params.dateRange) {
      const now = new Date();
      if (params.dateRange === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.discoveredAt = { gte: startOfDay };
      } else if (params.dateRange === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        where.discoveredAt = { gte: weekAgo };
      } else if (params.dateRange === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        where.discoveredAt = { gte: monthAgo };
      }
    }

    // Multi-field text search
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
        { repository: { contains: q } },
        { channel: { contains: q } },
        { author: { contains: q } }
      ];
    }

    // Sorting
    let orderBy: any = {};
    const order = params.sortOrder || 'desc';

    switch (params.sortBy) {
      case 'stars':
        orderBy = { stars: order };
        break;
      case 'forks':
        orderBy = { forks: order };
        break;
      case 'newest':
        orderBy = { publishedAt: order };
        break;
      case 'oldest':
        orderBy = { publishedAt: order === 'desc' ? 'asc' : 'desc' };
        break;
      case 'discovered':
        orderBy = { discoveredAt: order };
        break;
      case 'alphabetical':
        orderBy = { title: params.sortOrder || 'asc' };
        break;
      case 'relevance':
      default:
        orderBy = { importanceScore: 'desc' };
        break;
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.resource.count({ where })
    ]);

    // Format tags from comma-separated string to string array
    const formatted = resources.map(r => ({
      ...r,
      tags: r.tags ? r.tags.split(',').filter(Boolean) : []
    }));

    return {
      resources: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
