import { Order } from '../models/Order';
import { ServiceRequest } from '../models/ServiceRequest';
import { Payment } from '../models/Payment';
import { ProviderProfile } from '../models/ProviderProfile';
import { User } from '../models/User';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';
import { OrderStatus, UserRole } from '../types';
import { emailService } from './email.service';
import { env } from '../config/env';

class OrderService {
  async getMy(userId: string, role: UserRole, { page, limit, skip }: { page: number; limit: number; skip: number }) {
    const filter = role === 'client' ? { clientId: userId } : { providerId: userId };
    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate('serviceRequestId', 'description city urgency')
        .populate('quoteId', 'totalAmount depositAmount remainingAmount')
        .populate('clientId', 'name phone')
        .populate('providerId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(orderId: string, userId: string, role: UserRole) {
    const order = await Order.findById(orderId)
      .populate('serviceRequestId', 'description city neighborhood urgency desiredDate')
      .populate('quoteId', 'totalAmount depositAmount remainingAmount estimatedTime warrantyDays')
      .populate('clientId', 'name phone email')
      .populate('providerId', 'name phone email');

    if (!order) throw new NotFoundError('Ordem de serviço');

    if (role === 'client' && order.clientId._id.toString() !== userId) throw new ForbiddenError();
    if (role === 'provider' && order.providerId._id.toString() !== userId) throw new ForbiddenError();

    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, userId: string, role: UserRole, scheduledDate?: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');

    if (role === 'provider' && order.providerId.toString() !== userId) throw new ForbiddenError();

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      created: ['scheduled', 'cancelled'],
      scheduled: ['in_progress', 'cancelled'],
      in_progress: ['waiting_approval', 'cancelled'],
      waiting_approval: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new AppError(
        `Transição de status inválida: ${order.status} → ${newStatus}`,
        400
      );
    }

    if (newStatus === 'scheduled' && scheduledDate) {
      order.scheduledDate = new Date(scheduledDate);
    }

    // Provider can only move to in_progress if deposit is paid
    if (newStatus === 'in_progress') {
      if (order.status !== 'scheduled') {
        throw new AppError('Ordem precisa ter depósito pago para iniciar', 400);
      }
      const deposit = await Payment.findOne({ orderId: order._id, type: 'deposit', status: 'paid' });
      if (!deposit) throw new AppError('Depósito ainda não foi pago', 400);
      order.startedAt = new Date();
      await ServiceRequest.updateOne({ _id: order.serviceRequestId }, { status: 'in_progress' });
    }

    if (newStatus === 'waiting_approval') {
      await ServiceRequest.updateOne({ _id: order.serviceRequestId }, { status: 'waiting_approval' });
    }

    if (newStatus === 'cancelled') {
      await ServiceRequest.updateOne({ _id: order.serviceRequestId }, { status: 'cancelled' });
    }

    order.status = newStatus;
    await order.save();

    // Notifica as partes relevantes sobre a mudança de status (fire-and-forget)
    const notifyStatuses: OrderStatus[] = ['scheduled', 'in_progress', 'waiting_approval', 'completed', 'cancelled'];
    if (notifyStatuses.includes(newStatus)) {
      const ordersUrl = `${env.APP_URL}/cliente/ordens/${order._id.toString()}`;
      const recipientId = newStatus === 'waiting_approval' ? order.clientId : order.clientId;
      User.findById(recipientId).select('email name').then(u => {
        if (u) emailService.sendOrderStatusChange(u.email, u.name, newStatus, ordersUrl).catch(() => {});
      }).catch(() => {});
    }

    return order;
  }

  async updatePhotos(orderId: string, type: 'before' | 'after', paths: string[], providerId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');
    if (order.providerId.toString() !== providerId) throw new ForbiddenError();

    if (!['scheduled', 'in_progress', 'waiting_approval'].includes(order.status)) {
      throw new AppError('Não é possível adicionar fotos neste status da ordem', 400);
    }

    if (type === 'before') {
      order.beforePhotos.push(...paths);
    } else {
      order.afterPhotos.push(...paths);
    }
    await order.save();
    return order;
  }

  async updateSignature(orderId: string, sigType: 'client' | 'provider', signature: string, userId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');

    if (sigType === 'client' && order.clientId.toString() !== userId) throw new ForbiddenError();
    if (sigType === 'provider' && order.providerId.toString() !== userId) throw new ForbiddenError();

    if (sigType === 'client') order.clientSignature = signature;
    else order.providerSignature = signature;

    await order.save();
    return order;
  }

  async approveCompletion(orderId: string, clientId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');
    if (order.clientId.toString() !== clientId) throw new ForbiddenError();
    if (order.status !== 'waiting_approval') {
      throw new AppError('Ordem precisa estar em aguardando aprovação para ser concluída', 400);
    }

    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    await ServiceRequest.updateOne({ _id: order.serviceRequestId }, { status: 'completed' });
    await ProviderProfile.updateOne({ userId: order.providerId }, { $inc: { completedServices: 1 } });

    return order;
  }
}

export const orderService = new OrderService();
