import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // 10 tentativas por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  skip: (_req: Request, _res: Response, _next: NextFunction) => process.env.NODE_ENV === 'test',
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em breve.',
  },
  skip: (_req: Request, _res: Response, _next: NextFunction) => process.env.NODE_ENV === 'test',
});
