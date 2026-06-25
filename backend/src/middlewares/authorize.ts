import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Middleware para verificar o role do usuário.
 * Aceita um ou mais roles permitidos.
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Não autenticado');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Você não tem permissão para acessar este recurso');
    }

    next();
  };
}
