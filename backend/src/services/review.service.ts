import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { ProviderProfile } from '../models/ProviderProfile';
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { Types } from 'mongoose';
import { UserRole } from '../types';

interface CreateReviewInput {
  orderId: string;
  rating: number;
  comment?: string;
  punctuality?: number;
  quality?: number;
  communication?: number;
  cleanliness?: number;
}

class ReviewService {
  async create(input: CreateReviewInput, clientId: string) {
    const order = await Order.findById(input.orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');
    if (order.clientId.toString() !== clientId) throw new ForbiddenError();
    if (order.status !== 'completed') {
      throw new AppError('Somente ordens concluídas podem ser avaliadas', 400);
    }

    const existing = await Review.findOne({ orderId: input.orderId });
    if (existing) throw new ConflictError('Esta ordem já foi avaliada');

    const review = await Review.create({
      ...input,
      clientId,
      providerId: order.providerId,
    });

    const stats = await Review.aggregate([
      { $match: { providerId: new Types.ObjectId(order.providerId.toString()) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].avg * 100) / 100;
      await ProviderProfile.updateOne(
        { userId: order.providerId },
        { averageRating: avg, totalReviews: stats[0].count }
      );
    }

    return review;
  }

  async getByProvider(providerId: string) {
    return Review.find({ providerId })
      .populate('clientId', 'name')
      .populate('orderId', 'completedAt')
      .sort({ createdAt: -1 });
  }

  async getMy(userId: string, role: UserRole) {
    const filter = role === 'client' ? { clientId: userId } : { providerId: userId };
    return Review.find(filter)
      .populate('orderId', 'completedAt serviceRequestId')
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .sort({ createdAt: -1 });
  }
}

export const reviewService = new ReviewService();
