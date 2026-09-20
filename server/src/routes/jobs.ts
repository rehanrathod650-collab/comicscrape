import { Router, Request, Response } from 'express';
import { prisma } from '../db/client';

export const jobsRouter = Router();

// GET /api/jobs
jobsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.scraperJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formatted = jobs.map(j => ({
      ...j,
      sources: j.sources ? j.sources.split(',') : [],
      logs: j.logs ? JSON.parse(j.logs) : []
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id
jobsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.scraperJob.findUnique({
      where: { id }
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({
      ...job,
      sources: job.sources ? job.sources.split(',') : [],
      logs: job.logs ? JSON.parse(job.logs) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/retry
jobsRouter.post('/:id/retry', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.scraperJob.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updated = await prisma.scraperJob.update({
      where: { id },
      data: {
        status: 'RUNNING',
        progress: 20,
        currentTask: 'Retrying job execution...',
        startedAt: new Date()
      }
    });

    res.json({
      ...updated,
      sources: updated.sources ? updated.sources.split(',') : [],
      logs: updated.logs ? JSON.parse(updated.logs) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/:id
jobsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.scraperJob.delete({ where: { id } });
    res.json({ success: true, message: 'Job removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
