import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ServiceError } from './errors/ServiceError';
import authRouter from './routes/auth';
import campaignRouter from './routes/campaigns';
import { swaggerSpec, swaggerUi } from './swagger';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/campaigns', campaignRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler — must have exactly 4 params for Express to recognize it
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error(err);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
