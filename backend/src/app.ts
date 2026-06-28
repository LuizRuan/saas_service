import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { generalRateLimiter } from './middlewares/rateLimiter';
import routes from './routes';

const app = express();

// Lista explícita de origens permitidas
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  'https://saas-service-kappa.vercel.app',
  env.FRONTEND_URL,
].filter(Boolean));

// Middlewares globais
app.use(compression());
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", env.FRONTEND_URL],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite: sem origin (curl, Postman) ou origem na lista autorizada
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origem não permitida — ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Uploads locais (MVP)
app.use('/uploads', express.static('uploads', {
  setHeaders(res) {
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

// Rate limit global (antes das rotas)
app.use('/api', generalRateLimiter);

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
