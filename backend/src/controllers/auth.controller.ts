import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';

class AuthController {
  /**
   * POST /api/auth/register/client
   */
  async registerClient(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone, city, state } = req.body;

    const result = await authService.registerClient({
      name,
      email,
      password,
      phone,
      city,
      state,
    });

    sendSuccess(
      res,
      {
        user: result.user,
        token: result.token,
      },
      'Conta criada com sucesso!',
      201
    );
  }

  /**
   * POST /api/auth/register/provider
   */
  async registerProvider(req: Request, res: Response): Promise<void> {
    const {
      name,
      email,
      password,
      phone,
      city,
      state,
      professionalName,
      document,
      categories,
      cities,
    } = req.body;

    const result = await authService.registerProvider({
      name,
      email,
      password,
      phone,
      city,
      state,
      professionalName,
      document,
      categories,
      cities,
    });

    sendSuccess(
      res,
      {
        user: result.user,
        token: result.token,
      },
      'Conta de prestador criada com sucesso! Aguarde aprovação do admin.',
      201
    );
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    sendSuccess(res, {
      user: result.user,
      token: result.token,
    }, 'Login realizado com sucesso!');
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const data = await authService.getMe(userId);

    sendSuccess(res, data);
  }
}

export const authController = new AuthController();
