import { ServiceRequest } from '../models/ServiceRequest';
import { Quote } from '../models/Quote';
import { ProviderProfile } from '../models/ProviderProfile';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sanitizeServiceRequest } from '../utils/sanitize';
import { UserRole } from '../types';

interface CreateServiceRequestInput {
  clientId: string;
  categoryId: string;
  city: string;
  neighborhood?: string;
  approximateAddress?: string;
  fullAddress?: string;
  description: string;
  photos?: string[];
  desiredDate?: Date;
  desiredDateEnd?: Date;
  urgency?: string;
  budget?: number;
}

class ServiceRequestService {
  async create(input: CreateServiceRequestInput) {
    const request = await ServiceRequest.create(input);
    return request;
  }

  async getMy(clientId: string, { page, limit, skip }: { page: number; limit: number; skip: number }) {
    const [items, total] = await Promise.all([
      ServiceRequest.find({ clientId })
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceRequest.countDocuments({ clientId }),
    ]);
    return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getAvailable(providerId: string, { page, limit, skip }: { page: number; limit: number; skip: number }) {
    const profile = await ProviderProfile.findOne({ userId: providerId });
    if (!profile || profile.status !== 'approved') {
      throw new AppError('Apenas prestadores aprovados podem ver solicitações disponíveis', 403);
    }

    const filter = {
      status: { $in: ['open', 'quoted'] },
      city: { $in: profile.cities },
      categoryId: { $in: profile.categories },
    };
    const [items, total] = await Promise.all([
      ServiceRequest.find(filter)
        .select('-fullAddress')
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceRequest.countDocuments(filter),
    ]);
    return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getById(requestId: string, requesterId: string, requesterRole: UserRole) {
    const request = await ServiceRequest.findById(requestId).populate('categoryId', 'name slug');
    if (!request) throw new NotFoundError('Solicitação');

    if (requesterRole === 'provider') {
      const isSelected = request.selectedProviderId?.toString() === requesterId;
      if (!isSelected) {
        const profile = await ProviderProfile.findOne({ userId: requesterId });
        // Após .populate(), categoryId vira um objeto — precisamos pegar o _id explicitamente
        const rawCat: any = request.categoryId;
        const catId = rawCat?._id ? rawCat._id.toString() : rawCat?.toString?.() ?? '';
        const inCategories = profile?.categories.some(c => c.toString() === catId);
        // Comparação case-insensitive de cidades
        const inCities = profile?.cities.some(
          c => c.toLowerCase().trim() === request.city.toLowerCase().trim()
        );
        if (!inCategories || !inCities) throw new ForbiddenError();
      }
    } else if (requesterRole === 'client') {
      if (request.clientId.toString() !== requesterId) throw new ForbiddenError();
    }

    return sanitizeServiceRequest(request, requesterId, requesterRole);
  }


  async cancel(requestId: string, requesterId: string, requesterRole: UserRole) {
    const request = await ServiceRequest.findById(requestId);
    if (!request) throw new NotFoundError('Solicitação');

    if (requesterRole === 'client' && request.clientId.toString() !== requesterId) {
      throw new ForbiddenError();
    }

    const cancellable = ['open', 'quoted', 'scheduled'];
    if (!cancellable.includes(request.status)) {
      throw new AppError('Solicitação não pode ser cancelada neste status', 400);
    }

    request.status = 'cancelled';
    await request.save();

    await Quote.updateMany(
      { serviceRequestId: request._id, status: 'sent' },
      { status: 'expired' }
    );

    return request;
  }
}

export const serviceRequestService = new ServiceRequestService();
