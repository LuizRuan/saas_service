import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';

import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

// Middlewares globais
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Uploads locais (MVP)
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api', routes);

// Rota raiz
app.get('/', (_req, res) => {
  res.json({
    name: 'MãoCerta API',
    version: '1.0.0',
    description: 'Plataforma de contratação de prestadores de serviço locais',
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// Error handler global (deve ser o último middleware)
app.use(errorHandler);

export default app;
