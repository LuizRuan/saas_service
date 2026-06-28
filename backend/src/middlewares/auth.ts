import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  // Cookie takes priority; fall back to Bearer header for Postman/curl in dev
  const token =
    req.cookies?.accessToken ??
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Token não fornecido');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const token =
    req.cookies?.accessToken ??
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
  } catch {
    // Ignora token inválido na autenticação opcional
  }

  next();
}
