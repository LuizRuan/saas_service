import { User } from '../models/User';
import { ProviderProfile } from '../models/ProviderProfile';
import { ServiceRequest } from '../models/ServiceRequest';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { Dispute } from '../models/Dispute';
import { NotFoundError } from '../utils/errors';
import { DisputeStatus } from '../types';

class AdminService {
  async getStats() {
    const [
      totalUsers,
      totalClients,
      totalProviders,
      pendingProviders,
      totalRequests,
      openRequests,
      totalOrders,
      completedOrders,
      totalDisputes,
      openDisputes,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'provider' }),
      ProviderProfile.countDocuments({ status: 'pending' }),
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: 'open' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'completed' }),
      Dispute.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
    ]);

    // Últimas 5 solicitações abertas
    const recentRequests = await ServiceRequest.find({ status: 'open' })
      .populate('clientId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Últimos 5 prestadores pendentes
    const recentPendingProviders = await ProviderProfile.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Pedidos por categoria (para gráfico)
    const requestsByCategory = await ServiceRequest.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalUsers,
      totalClients,
      totalProviders,
      pendingProviders,
      totalRequests,
      openRequests,
      totalOrders,
      completedOrders,
      totalDisputes,
      openDisputes,
      recentRequests,
      recentPendingProviders,
      requestsByCategory,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);
    return { users, total, page, limit };
  }

  async getProviders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
      ProviderProfile.find()
        .populate('userId', 'name email phone city state status')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProviderProfile.countDocuments(),
    ]);
    return { providers, total, page, limit };
  }

  async approveProvider(profileId: string) {
    const profile = await ProviderProfile.findById(profileId);
    if (!profile) throw new NotFoundError('Prestador');
    profile.status = 'approved';
    await profile.save();
    return profile;
  }

  async blockProvider(profileId: string) {
    const profile = await ProviderProfile.findById(profileId);
    if (!profile) throw new NotFoundError('Prestador');
    profile.status = 'blocked';
    await profile.save();
    return profile;
  }

  async getServiceRequests(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      ServiceRequest.find()
        .populate('clientId', 'name email')
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceRequest.countDocuments(),
    ]);
    return { requests, total, page, limit };
  }

  async getOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find()
        .populate('clientId', 'name email')
        .populate('providerId', 'name email')
        .populate('quoteId', 'totalAmount depositAmount remainingAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(),
    ]);
    return { orders, total, page, limit };
  }

  async getPayments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find()
        .populate('clientId', 'name email')
        .populate('providerId', 'name email')
        .populate('orderId', 'status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(),
    ]);
    return { payments, total, page, limit };
  }

  async getDisputes(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [disputes, total] = await Promise.all([
      Dispute.find()
        .populate('openedBy', 'name email')
        .populate('orderId', 'clientId providerId status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Dispute.countDocuments(),
    ]);
    return { disputes, total, page, limit };
  }

  async updateDisputeStatus(disputeId: string, status: DisputeStatus, adminNotes?: string) {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) throw new NotFoundError('Disputa');
    dispute.status = status;
    if (adminNotes !== undefined) dispute.adminNotes = adminNotes;
    await dispute.save();
    return dispute;
  }
}

export const adminService = new AdminService();
