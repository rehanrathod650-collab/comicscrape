import { Router, Request, Response } from 'express';
import { prisma } from '../db/client';

export const collectionsRouter = Router();

// GET /api/collections
collectionsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = collections.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      color: c.color,
      icon: c.icon,
      resourceCount: c._count.resources,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections
collectionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        color: color || '#facc15',
        icon: icon || 'Folder'
      }
    });

    res.status(201).json({
      ...collection,
      resourceCount: 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id
collectionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: 'Collection deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
