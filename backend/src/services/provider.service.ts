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
      filter['cities'] = { $regex: city.trim(), $options: 'i' };
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

    // Busca média de avaliações para cada prestador
    const profilesWithRating = await Promise.all(
      profiles.map(async (profile) => {
        const reviews = await Review.aggregate([
          { $match: { providerId: profile.userId } },
          { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        const ratingData = reviews[0] ?? { avg: 0, count: 0 };
        return {
          ...profile.toObject(),
          averageRating: Math.round(ratingData.avg * 10) / 10,
          reviewCount: ratingData.count,
        };
      })
    );

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

  async getById(providerId: string) {
    const profile = await ProviderProfile.findOne({ userId: providerId })
      .populate('userId', 'name email city state')
      .populate('categories', 'name slug');

    if (!profile) throw new NotFoundError('Prestador');

    const reviews = await Review.find({ providerId })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const ratingAgg = await Review.aggregate([
      { $match: { providerId: profile.userId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    return {
      ...profile.toObject(),
      averageRating: ratingAgg[0]?.avg ?? 0,
      reviewCount: ratingAgg[0]?.count ?? 0,
      reviews,
    };
  }
}

export const providerService = new ProviderService();
