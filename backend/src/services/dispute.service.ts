import { Dispute } from '../models/Dispute';
import { Order } from '../models/Order';
import { ServiceRequest } from '../models/ServiceRequest';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { UserRole } from '../types';

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

    const existing = await Dispute.findOne({ orderId: input.orderId });
    if (existing) throw new ConflictError('Já existe uma disputa aberta para esta ordem');

    const dispute = await Dispute.create({ ...input, openedBy: userId });

    await ServiceRequest.updateOne({ _id: order.serviceRequestId }, { status: 'dispute' });

    return dispute;
  }

  async getMy(userId: string) {
    return Dispute.find({ openedBy: userId })
      .populate('orderId', 'status serviceRequestId')
      .sort({ createdAt: -1 });
  }

  async getById(disputeId: string, userId: string, role: UserRole) {
    const dispute = await Dispute.findById(disputeId)
      .populate('orderId', 'clientId providerId status serviceRequestId')
      .populate('openedBy', 'name');

    if (!dispute) throw new NotFoundError('Disputa');

    if (role !== 'admin') {
      const order = await Order.findById(dispute.orderId);
      if (!order) throw new NotFoundError('Ordem de serviço');
      const isInvolved =
        order.clientId.toString() === userId || order.providerId.toString() === userId;
      if (!isInvolved) throw new ForbiddenError();
    }

    return dispute;
  }
}

export const disputeService = new DisputeService();
