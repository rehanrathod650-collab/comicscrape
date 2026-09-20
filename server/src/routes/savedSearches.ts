import { Router, Request, Response } from 'express';
import { prisma } from '../db/client';

export const savedSearchesRouter = Router();

// GET /api/saved-searches
savedSearchesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.savedSearch.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const formatted = items.map(s => ({
      ...s,
      sources: s.sources ? s.sources.split(',') : []
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/saved-searches
savedSearchesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { query, sources, frequency, notifyOnNew } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const saved = await prisma.savedSearch.create({
      data: {
        query,
        sources: Array.isArray(sources) ? sources.join(',') : 'GITHUB,TELEGRAM',
        frequency: frequency || 'DAILY',
        notifyOnNew: notifyOnNew ?? true
      }
    });

    res.status(201).json({
      ...saved,
      sources: saved.sources.split(',')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/saved-searches/:id
savedSearchesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.savedSearch.delete({ where: { id } });
    res.json({ success: true, message: 'Saved search deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
