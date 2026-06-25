import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { quoteService } from '../services/quote.service';
import { sendSuccess } from '../utils/response';

class QuoteController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { serviceRequestId, totalAmount, description, estimatedTime, warrantyDays } = req.body;
    const quote = await quoteService.create(
      { serviceRequestId, totalAmount, description, estimatedTime, warrantyDays },
      req.user!.userId
    );
    sendSuccess(res, quote, 'Orçamento enviado com sucesso!', 201);
  }

  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const quotes = await quoteService.getMy(req.user!.userId, req.user!.role);
    sendSuccess(res, quotes);
  }

  async getByRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    const serviceRequestId = String(req.params['serviceRequestId']);
    const quotes = await quoteService.getByRequest(serviceRequestId, req.user!.userId, req.user!.role);
    sendSuccess(res, quotes);
  }

  async accept(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const order = await quoteService.accept(id, req.user!.userId);
    sendSuccess(res, order, 'Orçamento aceito! Ordem de serviço criada.');
  }

  async reject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const quote = await quoteService.reject(id, req.user!.userId);
    sendSuccess(res, quote, 'Orçamento rejeitado.');
  }
}

export const quoteController = new QuoteController();
