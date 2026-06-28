import { Dispute } from '../models/Dispute';
import { Order } from '../models/Order';
import { ServiceRequest } from '../models/ServiceRequest';
import { AppError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { UserRole } from '../types';
import type { OrderStatus } from '../types';

interface CreateDisputeInput {
  orderId: string;
  reason: string;
  description: string;
  evidencePhotos?: string[];
}

class DisputeService {
  async create(input: CreateDisputeInput, userId: string) {
    const order = await Order.findById(input.orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');

    const isInvolved =
      order.clientId.toString() === userId || order.providerId.toString() === userId;
    if (!isInvolved) throw new ForbiddenError();

    const allowedForDispute: OrderStatus[] = ['in_progress', 'waiting_approval', 'completed'];
    if (!allowedForDispute.includes(order.status as OrderStatus)) {
      throw new AppError('Disputas só podem ser abertas durante ou após a execução do serviço', 400);
    }

    const existing = await Dispute.findOne({ orderId: input.orderId });
    if (existing) throw new ConflictError('Já existe uma disputa aberta para esta ordem');

    const dispute = await Dispute.create({ ...input, openedBy: userId });

    await ServiceRequest.updateOne({ _id: order.serviceRequestId }, { status: 'dispute' });

    return dispute;
  }

  async getMy(userId: string, role: UserRole, { page, limit, skip }: { page: number; limit: number; skip: number }) {
    let filter: object;
    if (role === 'provider') {
      const orderIds = await Order.find({ providerId: userId }).distinct('_id');
      filter = { $or: [{ openedBy: userId }, { orderId: { $in: orderIds } }] };
    } else {
      filter = { openedBy: userId };
    }
    const [items, total] = await Promise.all([
      Dispute.find(filter)
        .populate('orderId', 'status serviceRequestId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Dispute.countDocuments(filter),
    ]);
    return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(disputeId: string, userId: string, role: UserRole) {
    const dispute = await Dispute.findById(disputeId)
      .populate('orderId', 'clientId providerId status serviceRequestId')
      .populate('openedBy', 'name');

    if (!dispute) throw new NotFoundError('Disputa');

    if (role !== 'admin') {
      const order = dispute.orderId as any; // já populado com clientId e providerId
      if (!order) throw new NotFoundError('Ordem de serviço');
      const isInvolved =
        order.clientId.toString() === userId || order.providerId.toString() === userId;
      if (!isInvolved) throw new ForbiddenError();
    }

    return dispute;
  }
}

export const disputeService = new DisputeService();
