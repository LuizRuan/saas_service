import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erro operacional (esperado)
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const errors = Object.values(mongooseErr.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      message: 'Erro de validação',
      errors,
    });
    return;
  }

  // Erro de duplicidade MongoDB
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    res.status(409).json({
      success: false,
      message: `Já existe um registro com este ${field}`,
    });
    return;
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'ID inválido',
    });
    return;
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
    return;
  }

  // Erro não tratado
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
}
