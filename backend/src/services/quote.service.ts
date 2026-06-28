import { Quote } from '../models/Quote';
import { ServiceRequest } from '../models/ServiceRequest';
import { Order } from '../models/Order';
import { ProviderProfile } from '../models/ProviderProfile';
import { User } from '../models/User';
import { AppError, ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import { UserRole } from '../types';
import { emailService } from './email.service';
import { env } from '../config/env';

interface CreateQuoteInput {
  serviceRequestId: string;
  totalAmount: number;
  description?: string;
  estimatedTime?: string;
  warrantyDays?: number;
}

class QuoteService {
  async create(input: CreateQuoteInput, providerId: string) {
    const profile = await ProviderProfile.findOne({ userId: providerId });
    if (!profile || profile.status !== 'approved') {
      throw new AppError('Apenas prestadores aprovados podem enviar orçamentos', 403);
    }

    const request = await ServiceRequest.findById(input.serviceRequestId);
    if (!request) throw new NotFoundError('Solicitação');

    if (!['open', 'quoted'].includes(request.status)) {
      throw new AppError('Esta solicitação não está disponível para orçamento', 400);
    }

    const existing = await Quote.findOne({
      serviceRequestId: input.serviceRequestId,
      providerId,
      status: { $in: ['sent', 'accepted'] },
    });
    if (existing) throw new ConflictError('Você já enviou um orçamento para esta solicitação');

    const quote = await Quote.create({ ...input, providerId });

    if (request.status === 'open') {
      await ServiceRequest.updateOne({ _id: request._id }, { status: 'quoted' });
    }

    // Notifica o cliente sobre o novo orçamento (fire-and-forget)
    const [client, provider] = await Promise.all([
      User.findById(request.clientId).select('email name'),
      User.findById(providerId).select('name'),
    ]);
    if (client && provider) {
      const dashboardUrl = `${env.APP_URL}/cliente/solicitacoes/${request._id.toString()}`;
      emailService.sendNewQuoteReceived(
        client.email, client.name, request.description?.slice(0, 80) ?? 'Solicitação de serviço',
        provider.name, dashboardUrl
      ).catch(() => {});
    }

    return quote;
  }

  async getMy(userId: string, role: UserRole, { page, limit, skip }: { page: number; limit: number; skip: number }) {
    if (role === 'provider') {
      const filter = { providerId: userId };
      const [items, total] = await Promise.all([
        Quote.find(filter)
          .populate('serviceRequestId', 'description city status urgency')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Quote.countDocuments(filter),
      ]);
      return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    const myRequestIds = await ServiceRequest.find({ clientId: userId }).distinct('_id');
    const filter = { serviceRequestId: { $in: myRequestIds } };
    const [items, total] = await Promise.all([
      Quote.find(filter)
        .populate('serviceRequestId', 'description city status urgency')
        .populate('providerId', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quote.countDocuments(filter),
    ]);
    return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getByRequest(requestId: string, userId: string, role: UserRole) {
    if (role === 'client') {
      const request = await ServiceRequest.findById(requestId);
      if (!request) throw new NotFoundError('Solicitação');
      if (request.clientId.toString() !== userId) throw new ForbiddenError();
    } else if (role !== 'admin') {
      throw new ForbiddenError();
    }

    return Quote.find({ serviceRequestId: requestId })
      .populate('providerId', 'name city')
      .sort({ createdAt: -1 });
  }

  async accept(quoteId: string, clientId: string) {
    const quote = await Quote.findOneAndUpdate(
      { _id: quoteId, status: 'sent' },
      { status: 'accepted' },
      { new: true }
    );
    if (!quote) throw new AppError('Orçamento não está disponível para aceite', 409);

    const request = await ServiceRequest.findById(quote.serviceRequestId);
    if (!request) throw new NotFoundError('Solicitação');
    if (request.clientId.toString() !== clientId) {
      await Quote.updateOne({ _id: quoteId }, { status: 'sent' });
      throw new ForbiddenError();
    }

    if (!['open', 'quoted'].includes(request.status)) {
      await Quote.updateOne({ _id: quoteId }, { status: 'sent' });
      throw new AppError('Esta solicitação não pode ter orçamento aceito neste status', 400);
    }
    await Quote.updateMany(
      { serviceRequestId: quote.serviceRequestId, _id: { $ne: quoteId }, status: 'sent' },
      { status: 'rejected' }
    );
    await ServiceRequest.updateOne(
      { _id: quote.serviceRequestId },
      { status: 'scheduled', selectedProviderId: quote.providerId }
    );

    const order = await Order.create({
      serviceRequestId: quote.serviceRequestId,
      quoteId: quote._id,
      clientId: request.clientId,
      providerId: quote.providerId,
      status: 'created',
    });

    // Notifica o prestador que o orçamento foi aceito (fire-and-forget)
    User.findById(quote.providerId).select('email name').then(provider => {
      if (provider) {
        const ordersUrl = `${env.APP_URL}/prestador/ordens/${order._id.toString()}`;
        emailService.sendQuoteAccepted(
          provider.email, provider.name,
          request.description?.slice(0, 80) ?? 'Solicitação de serviço',
          ordersUrl
        ).catch(() => {});
      }
    }).catch(() => {});

    return order;
  }

  async reject(quoteId: string, clientId: string) {
    const quote = await Quote.findById(quoteId);
    if (!quote) throw new NotFoundError('Orçamento');
    if (quote.status !== 'sent') throw new AppError('Orçamento não pode ser rejeitado neste status', 400);

    const request = await ServiceRequest.findById(quote.serviceRequestId);
    if (!request) throw new NotFoundError('Solicitação');
    if (request.clientId.toString() !== clientId) throw new ForbiddenError();

    await Quote.updateOne({ _id: quoteId }, { status: 'rejected' });
    return Quote.findById(quoteId);
  }
}

export const quoteService = new QuoteService();
