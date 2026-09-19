import cors from 'cors';
import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import visitRoutes from './routes/visitRoutes';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(env.uploadDir)));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/visits', visitRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
