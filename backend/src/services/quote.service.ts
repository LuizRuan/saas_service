import { Quote } from '../models/Quote';
import { ServiceRequest } from '../models/ServiceRequest';
import { Order } from '../models/Order';
import { ProviderProfile } from '../models/ProviderProfile';
import { AppError, ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import { UserRole } from '../types';

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

    return quote;
  }

  async getMy(userId: string, role: UserRole) {
    if (role === 'provider') {
      return Quote.find({ providerId: userId })
        .populate('serviceRequestId', 'description city status urgency')
        .sort({ createdAt: -1 });
    }

    const myRequestIds = await ServiceRequest.find({ clientId: userId }).distinct('_id');
    return Quote.find({ serviceRequestId: { $in: myRequestIds } })
      .populate('serviceRequestId', 'description city status urgency')
      .populate('providerId', 'name city')
      .sort({ createdAt: -1 });
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
    const quote = await Quote.findById(quoteId);
    if (!quote) throw new NotFoundError('Orçamento');
    if (quote.status !== 'sent') throw new AppError('Orçamento não está disponível para aceite', 400);

    const request = await ServiceRequest.findById(quote.serviceRequestId);
    if (!request) throw new NotFoundError('Solicitação');
    if (request.clientId.toString() !== clientId) throw new ForbiddenError();

    if (!['open', 'quoted'].includes(request.status)) {
      throw new AppError('Esta solicitação não pode ter orçamento aceito neste status', 400);
    }

    await Quote.updateOne({ _id: quoteId }, { status: 'accepted' });
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
