import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

// In production the frontend (Vercel) and backend (Render) are on different domains,
// so cookies must use sameSite:'none' + secure:true to be sent on cross-origin requests.
const IS_PROD = env.NODE_ENV === 'production';
const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'none' : 'strict') as 'none' | 'strict',
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 1000, // 1h
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_BASE,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
}

class AuthController {
  async registerClient(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone, city, state } = req.body;

    const result = await authService.registerClient({
      name, email, password, phone, city, state,
    });

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, { user: result.user }, 'Conta criada com sucesso!', 201);
  }

  async registerProvider(req: Request, res: Response): Promise<void> {
    const {
      name, email, password, phone, city, state,
      professionalName, document, bio, categories, cities, neighborhoods,
    } = req.body;

    const result = await authService.registerProvider({
      name, email, password, phone, city, state,
      professionalName, document, bio, categories, cities, neighborhoods,
    });

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, { user: result.user }, 'Conta de prestador criada com sucesso! Aguarde aprovação do admin.', 201);
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, { user: result.user }, 'Login realizado com sucesso!');
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = (req as any).cookies?.refreshToken as string | undefined;
    if (!token) throw new UnauthorizedError('Token de renovação não fornecido');

    const { accessToken } = await authService.refreshAccessToken(token);
    res.cookie('accessToken', accessToken, { ...COOKIE_BASE, maxAge: 60 * 60 * 1000 });
    sendSuccess(res, null, 'Sessão renovada com sucesso!');
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    await authService.logout(req.user!.userId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    sendSuccess(res, null, 'Logout realizado com sucesso!');
  }

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const data = await authService.getMe(userId);
    sendSuccess(res, data);
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (email) {
      // fire-and-forget — sempre retorna 200 para não vazar se email existe
      authService.forgotPassword(String(email)).catch(() => {});
    }
    sendSuccess(res, null, 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.');
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios' });
      return;
    }
    await authService.resetPassword(String(token), String(password));
    sendSuccess(res, null, 'Senha redefinida com sucesso! Faça login com sua nova senha.');
  }

  async updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { name, phone, city, state } = req.body;
    const user = await authService.updateMe(userId, { name, phone, city, state });
    sendSuccess(res, { user }, 'Perfil atualizado com sucesso');
  }
}

export const authController = new AuthController();
