import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { providerService } from '../services/provider.service';
import { sendSuccess } from '../utils/response';

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
}

export const providerController = new ProviderController();
