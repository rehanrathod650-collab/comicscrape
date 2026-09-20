import { Router, Request, Response } from 'express';
import { prisma } from '../db/client';
import { GitHubConnector } from '../connectors/github.connector';
import { TelegramConnector } from '../connectors/telegram.connector';

export const sourcesRouter = Router();

// GET /api/sources
sourcesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const sources = await prisma.source.findMany();
    const formatted = sources.map(s => ({
      ...s,
      config: s.config ? JSON.parse(s.config) : {}
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sources/:id
sourcesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { config, status } = req.body;
    const existing = await prisma.source.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Source not found' });
    }

    const currentConfig = existing.config ? JSON.parse(existing.config) : {};
    const mergedConfig = { ...currentConfig, ...config };

    const updated = await prisma.source.update({
      where: { id },
      data: {
        config: JSON.stringify(mergedConfig),
        status: status || 'CONNECTED',
        lastSyncAt: new Date()
      }
    });

    res.json({
      ...updated,
      config: mergedConfig
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sources/:id/test
sourcesRouter.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const source = await prisma.source.findUnique({ where: { id } });
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }

    let result;
    if (source.type === 'GITHUB') {
      const connector = new GitHubConnector(process.env.GITHUB_TOKEN);
      result = await connector.testConnection();
    } else {
      const connector = new TelegramConnector(process.env.TELEGRAM_BOT_TOKEN);
      result = await connector.testConnection();
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
