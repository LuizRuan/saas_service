import { User } from '../models/User';
import { ProviderProfile } from '../models/ProviderProfile';
import { ServiceRequest } from '../models/ServiceRequest';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { Dispute } from '../models/Dispute';
import { NotFoundError } from '../utils/errors';
import { DisputeStatus } from '../types';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

class AdminService {
  async getStats() {
    const ACTIVE_FILTER = { status: { $ne: 'deleted' as const } };

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
      User.countDocuments(ACTIVE_FILTER),
      User.countDocuments({ role: 'client', ...ACTIVE_FILTER }),
      User.countDocuments({ role: 'provider', ...ACTIVE_FILTER }),
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
    const filter = { status: { $ne: 'deleted' as const } };
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
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

  async approveProvider(profileId: string, adminId: string) {
    const profile = await ProviderProfile.findById(profileId).populate<{ userId: { _id: mongoose.Types.ObjectId; name: string } }>('userId', 'name');
    if (!profile) throw new NotFoundError('Prestador');
    const previousStatus = profile.status;
    profile.status = 'approved';
    await profile.save();
    const admin = await User.findById(adminId).select('name');
    AuditLog.create({
      targetUserId: profile.userId._id,
      targetUserName: (profile.userId as any).name ?? 'Desconhecido',
      adminId: new mongoose.Types.ObjectId(adminId),
      adminName: admin?.name ?? 'Desconhecido',
      action: 'approve_provider',
      previousStatus,
      newStatus: 'approved',
    }).catch(err => console.error('[audit]', err));
    return profile;
  }

  async blockProvider(profileId: string, adminId: string) {
    const profile = await ProviderProfile.findById(profileId).populate<{ userId: { _id: mongoose.Types.ObjectId; name: string } }>('userId', 'name');
    if (!profile) throw new NotFoundError('Prestador');
    const previousStatus = profile.status;
    profile.status = 'blocked';
    await profile.save();
    const admin = await User.findById(adminId).select('name');
    AuditLog.create({
      targetUserId: profile.userId._id,
      targetUserName: (profile.userId as any).name ?? 'Desconhecido',
      adminId: new mongoose.Types.ObjectId(adminId),
      adminName: admin?.name ?? 'Desconhecido',
      action: 'block_provider',
      previousStatus,
      newStatus: 'blocked',
    }).catch(err => console.error('[audit]', err));
    return profile;
  }

  async blockUser(targetId: string, adminId: string, durationDays: number, reason?: string) {
    if (targetId === adminId) {
      throw new AppError('Voce nao pode bloquear sua propria conta', 400);
    }

    const target = await User.findById(targetId);
    if (!target) throw new NotFoundError('Usuario');
    if (target.status === 'deleted') {
      throw new AppError('Usuario excluido nao pode ser bloqueado', 400);
    }

    if (target.role === 'admin') {
      const remainingActiveAdmins = await User.countDocuments({
        role: 'admin',
        status: 'active',
        _id: { $ne: new mongoose.Types.ObjectId(targetId) },
      });
      if (remainingActiveAdmins === 0) {
        throw new AppError('Nao e possivel bloquear o ultimo administrador ativo', 400);
      }
    }

    const previousStatus = target.status as string;
    const blockedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(targetId, {
      $set: {
        status: 'blocked',
        blockedUntil,
        blockedReason: reason ?? null,
        blockedBy: new mongoose.Types.ObjectId(adminId),
      },
    });

    const admin = await User.findById(adminId).select('name');

    await AuditLog.create({
      targetUserId:   new mongoose.Types.ObjectId(targetId),
      targetUserName: target.name,
      adminId:        new mongoose.Types.ObjectId(adminId),
      adminName:      admin?.name ?? 'Desconhecido',
      action:         'block_user',
      reason:         reason ?? undefined,
      blockedUntil,
      previousStatus,
      newStatus: 'blocked',
    });

    return await User.findById(targetId);
  }

  async unblockUser(targetId: string, adminId: string) {
    const target = await User.findById(targetId);
    if (!target) throw new NotFoundError('Usuario');
    if (target.status === 'deleted') {
      throw new AppError('Usuario excluido nao pode ser desbloqueado', 400);
    }

    const previousStatus = target.status as string;

    await User.findByIdAndUpdate(targetId, {
      $set: { status: 'active' },
      $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
    });

    const admin = await User.findById(adminId).select('name');

    await AuditLog.create({
      targetUserId:   new mongoose.Types.ObjectId(targetId),
      targetUserName: target.name,
      adminId:        new mongoose.Types.ObjectId(adminId),
      adminName:      admin?.name ?? 'Desconhecido',
      action:         'unblock_user',
      previousStatus,
      newStatus: 'active',
    });

    return await User.findById(targetId);
  }

  async deleteUser(targetId: string, adminId: string) {
    if (targetId === adminId) {
      throw new AppError('Voce nao pode excluir sua propria conta', 400);
    }

    const target = await User.findById(targetId);
    if (!target) throw new NotFoundError('Usuario');
    if (target.status === 'deleted') {
      throw new AppError('Usuario ja foi excluido', 400);
    }

    if (target.role === 'admin') {
      const remainingAdmins = await User.countDocuments({
        role: 'admin',
        status: { $in: ['active', 'blocked'] },
        _id: { $ne: new mongoose.Types.ObjectId(targetId) },
      });
      if (remainingAdmins === 0) {
        throw new AppError('Nao e possivel excluir o unico administrador restante', 400);
      }
    }

    const previousStatus = target.status as string;

    await User.findByIdAndUpdate(targetId, {
      $set: {
        status:    'deleted',
        deletedAt: new Date(),
        deletedBy: new mongoose.Types.ObjectId(adminId),
      },
    });

    const admin = await User.findById(adminId).select('name');

    await AuditLog.create({
      targetUserId:   new mongoose.Types.ObjectId(targetId),
      targetUserName: target.name,
      adminId:        new mongoose.Types.ObjectId(adminId),
      adminName:      admin?.name ?? 'Desconhecido',
      action:         'delete_user',
      previousStatus,
      newStatus: 'deleted',
    });

    return { success: true };
  }

  async getUserHistory(targetId: string) {
    const logs = await AuditLog.find({
      targetUserId: new mongoose.Types.ObjectId(targetId),
    })
      .sort({ createdAt: -1 })
      .limit(50);
    return logs;
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

  async updateDisputeStatus(disputeId: string, status: DisputeStatus, adminNotes: string | undefined, adminId: string) {
    const dispute = await Dispute.findById(disputeId).populate<{ openedBy: { _id: mongoose.Types.ObjectId; name: string } }>('openedBy', 'name');
    if (!dispute) throw new NotFoundError('Disputa');
    const previousStatus = dispute.status;
    dispute.status = status;
    if (adminNotes !== undefined) dispute.adminNotes = adminNotes;
    await dispute.save();
    const admin = await User.findById(adminId).select('name');
    AuditLog.create({
      targetUserId: (dispute.openedBy as any)._id ?? dispute.openedBy,
      targetUserName: (dispute.openedBy as any).name ?? 'Desconhecido',
      adminId: new mongoose.Types.ObjectId(adminId),
      adminName: admin?.name ?? 'Desconhecido',
      action: 'resolve_dispute',
      previousStatus,
      newStatus: status,
      metadata: { disputeId, adminNotes },
    }).catch(err => console.error('[audit]', err));
    return dispute;
  }
}

export const adminService = new AdminService();
