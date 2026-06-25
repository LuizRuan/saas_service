import { Request, Response } from 'express';
import { RateLimitRequestHandler } from 'express-rate-limit';

// Importação dinâmica para evitar erro se o pacote não estiver instalado
let rateLimit: (options: any) => RateLimitRequestHandler;

try {
  rateLimit = require('express-rate-limit');
} catch {
  // Fallback no-op caso o pacote não esteja instalado
  rateLimit = () => (_req: Request, _res: Response, next: () => void) => next();
}

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // 10 tentativas por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  skip: (req: Request) => process.env.NODE_ENV === 'test',
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
  skip: (req: Request) => process.env.NODE_ENV === 'test',
});
