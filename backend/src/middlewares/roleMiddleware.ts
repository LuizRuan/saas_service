import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { AppError } from './errorMiddleware';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Não autenticado', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Sem permissão para acessar este recurso', 403, 'FORBIDDEN'));
    }

    next();
  };
}
