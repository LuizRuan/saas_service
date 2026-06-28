import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { providerService } from '../services/provider.service';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { updateProviderProfileSchema } from '../schemas/provider.schema';

class ProviderController {
  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    const city = req.query['city'] as string | undefined;
    const category = req.query['category'] as string | undefined;
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 12;

    const result = await providerService.search({ city, category, page, limit });
    sendSuccess(res, result);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const result = await providerService.getById(id);
    sendSuccess(res, result);
  }

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const result = await providerService.getMe(userId);
    sendSuccess(res, result);
  }

  async updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const parsed = updateProviderProfileSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Dados inválidos', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    const result = await providerService.updateMe(userId, parsed.data);
    sendSuccess(res, result, 'Perfil atualizado com sucesso');
  }
}

export const providerController = new ProviderController();
