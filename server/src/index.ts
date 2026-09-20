import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { resourcesRouter } from './routes/resources';
import { discoverRouter } from './routes/discover';
import { jobsRouter } from './routes/jobs';
import { collectionsRouter } from './routes/collections';
import { savedSearchesRouter } from './routes/savedSearches';
import { sourcesRouter } from './routes/sources';
import { notificationsRouter } from './routes/notifications';
import { analyticsRouter } from './routes/analytics';
import { SchedulerService } from './services/scheduler';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ComicScrape API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/resources', resourcesRouter);
app.use('/api/discover', discoverRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/saved-searches', savedSearchesRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);

// Serve frontend build if dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`⚡ ComicScrape API Server listening on port ${PORT}`);
  console.log(`🎯 Frontend web application ready on http://localhost:5173`);
  SchedulerService.start();
});
