import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorMiddleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.isDevelopment) {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
