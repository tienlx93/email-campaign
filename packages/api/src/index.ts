import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initScheduler, cancelAllJobs } from './scheduler';

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
