import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, error: 'Dados inválidos', details: err.message });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ success: false, error: 'ID inválido' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((err as any).code === 11000) {
    res.status(409).json({ success: false, error: 'Registro duplicado', code: 'DUPLICATE' });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: 'Token inválido', code: 'UNAUTHORIZED' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    return;
  }

  console.error('❌ Erro não tratado:', err);

  res.status(500).json({
    success: false,
    error: env.isDevelopment ? err.message : 'Erro interno do servidor',
    ...(env.isDevelopment && { stack: err.stack }),
  });
}
