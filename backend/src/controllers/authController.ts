import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function registerClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerClient(req.body);
    res.status(201).json({ success: true, data: result, message: 'Conta criada com sucesso' });
  } catch (err) {
    next(err);
  }
}

export async function registerProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerProvider(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Conta de prestador criada com sucesso. Aguarde a aprovação do administrador.',
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result, message: 'Login realizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
