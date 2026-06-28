import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { reviewService } from '../services/review.service';
import { sendSuccess } from '../utils/response';
import { parsePagination } from '../utils/pagination';

class ReviewController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId, rating, comment, punctuality, quality, communication, cleanliness } = req.body;
    const review = await reviewService.create(
      { orderId, rating, comment, punctuality, quality, communication, cleanliness },
      req.user!.userId
    );
    sendSuccess(res, review, 'Avaliação registrada com sucesso!', 201);
  }

  async getByProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const providerId = String(req.params['providerId']);
    const pagination = parsePagination(req.query);
    const result = await reviewService.getByProvider(providerId, pagination);
    sendSuccess(res, result);
  }

  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const pagination = parsePagination(req.query);
    const result = await reviewService.getMy(req.user!.userId, req.user!.role, pagination);
    sendSuccess(res, result);
  }
}

export const reviewController = new ReviewController();
