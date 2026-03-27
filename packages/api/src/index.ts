import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth';
import campaignRouter from './routes/campaigns';
import { swaggerSpec, swaggerUi } from './swagger';
import { initScheduler, cancelAllJobs } from './scheduler';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/campaigns', campaignRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`API running on port ${PORT}`);
  try {
    await initScheduler();
    console.log('Scheduler initialized');
  } catch (err) {
    console.error('Failed to initialize scheduler:', err);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  cancelAllJobs();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  cancelAllJobs();
  server.close(() => process.exit(0));
});

export default app;
