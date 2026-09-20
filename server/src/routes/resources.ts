import { Router, Request, Response } from 'express';
import { SearchService } from '../services/search';
import { prisma } from '../db/client';

export const resourcesRouter = Router();

// GET /api/resources
resourcesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      sources,
      resourceTypes,
      languages,
      fileTypes,
      minStars,
      dateRange,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    const result = await SearchService.queryResources({
      search: search as string,
      sources: sources ? (sources as string).split(',') : undefined,
      resourceTypes: resourceTypes ? (resourceTypes as string).split(',') : undefined,
      languages: languages ? (languages as string).split(',') : undefined,
      fileTypes: fileTypes ? (fileTypes as string).split(',') : undefined,
      minStars: minStars ? parseInt(minStars as string, 10) : undefined,
      dateRange: dateRange as string,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/:id
resourcesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const resource = await prisma.resource.findUnique({
      where: { id }
    });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({
      ...resource,
      tags: resource.tags ? resource.tags.split(',').filter(Boolean) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resources/:id/save
resourcesRouter.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { collectionId } = req.body;
    if (collectionId) {
      await prisma.collectionResource.upsert({
        where: {
          collectionId_resourceId: {
            collectionId,
            resourceId: id
          }
        },
        create: {
          collectionId,
          resourceId: id
        },
        update: {}
      });
    }
    res.json({ success: true, message: 'Resource saved successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
