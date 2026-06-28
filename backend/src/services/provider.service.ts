import { ProviderProfile } from '../models/ProviderProfile';
import { Category } from '../models/Category';
import { Review } from '../models/Review';
import { NotFoundError } from '../utils/errors';

interface SearchInput {
  city?: string;
  category?: string;
  page: number;
  limit: number;
}

class ProviderService {
  async search({ city, category, page, limit }: SearchInput) {
    const skip = (page - 1) * limit;

    // Monta o filtro base — apenas aprovados
    const filter: Record<string, any> = { status: 'approved' };

    // Filtro por cidade (case-insensitive)
    if (city && city.trim()) {
      const escaped = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter['cities'] = { $regex: escaped, $options: 'i' };
    }

    // Filtro por categoria (via _id ou slug)
    if (category && category.trim()) {
      const cat = await Category.findOne({
        $or: [
          { slug: category.trim() },
          { _id: category.trim().match(/^[a-f\d]{24}$/i) ? category.trim() : null },
        ],
      });
      if (cat) {
        filter['categories'] = cat._id;
      }
    }

    const [profiles, total] = await Promise.all([
      ProviderProfile.find(filter)
        .populate('userId', 'name email city state')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProviderProfile.countDocuments(filter),
    ]);

    // Busca média de avaliações em uma única aggregation (evita N+1)
    const providerIds = profiles.map(p => p.userId);
    const ratingsRaw = await Review.aggregate([
      { $match: { providerId: { $in: providerIds } } },
      { $group: { _id: '$providerId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const ratingsMap = new Map(ratingsRaw.map(r => [r._id.toString(), r]));

    const profilesWithRating = profiles.map(profile => {
      const r = ratingsMap.get((profile.userId as any)?.toString() ?? '');
      return {
        ...profile.toObject(),
        averageRating: r ? Math.round(r.avg * 10) / 10 : 0,
        reviewCount: r?.count ?? 0,
      };
    });

    return {
      providers: profilesWithRating,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMe(userId: string) {
    const profile = await ProviderProfile.findOne({ userId })
      .populate('userId', 'name email phone city state')
      .populate('categories', 'name slug');
    if (!profile) throw new NotFoundError('Perfil de prestador');
    return profile;
  }

  async updateMe(userId: string, input: {
    professionalName?: string;
    bio?: string;
    categories?: string[];
    cities?: string[];
    neighborhoods?: string[];
  }) {
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId },
      { $set: input },
      { new: true, runValidators: true }
    ).populate('categories', 'name slug');
    if (!profile) throw new NotFoundError('Perfil de prestador');
    return profile;
  }

  async getById(providerId: string) {
    const profile = await ProviderProfile.findOne({ userId: providerId, status: 'approved' })
      .populate('userId', 'name email city state')
      .populate('categories', 'name slug');

    if (!profile) throw new NotFoundError('Prestador');

    const reviews = await Review.find({ providerId })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      ...profile.toObject(),
      reviewCount: profile.totalReviews,
      reviews,
    };
  }
}

export const providerService = new ProviderService();
