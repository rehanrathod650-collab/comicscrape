import { Router, Request, Response } from 'express';
import { JobQueue } from '../services/queue';
import { SourceType } from '../connectors/types';

export const discoverRouter = Router();

// POST /api/discover
discoverRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { query, sources, schedule } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'A search query string is required' });
    }

    const targetSources: SourceType[] = Array.isArray(sources) && sources.length > 0
      ? sources
      : ['GITHUB', 'TELEGRAM'];

    const job = await JobQueue.enqueue({
      type: 'MANUAL_DISCOVERY',
      query: query.trim(),
      sources: targetSources,
      schedule
    });

    res.status(202).json({
      ...job,
      sources: targetSources,
      logs: job.logs ? JSON.parse(job.logs) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
