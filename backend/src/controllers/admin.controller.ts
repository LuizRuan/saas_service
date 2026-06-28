import { Response } from 'express';
import { AuthenticatedRequest, DisputeStatus } from '../types';
import { adminService } from '../services/admin.service';
import { sendSuccess } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { ValidationError } from '../utils/errors';
import { blockUserSchema, updateDisputeStatusSchema } from '../schemas/admin.schema';

class AdminController {
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await adminService.getStats();
    sendSuccess(res, result);
  }

  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.getUsers(page, limit);
    sendSuccess(res, result);
  }

  async getProviders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.getProviders(page, limit);
    sendSuccess(res, result);
  }

  async approveProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const profile = await adminService.approveProvider(id, req.user!.userId);
    sendSuccess(res, profile, 'Prestador aprovado com sucesso!');
  }

  async blockProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const profile = await adminService.blockProvider(id, req.user!.userId);
    sendSuccess(res, profile, 'Prestador bloqueado com sucesso!');
  }

  async blockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const adminId = String(req.user!.userId);
    const parsed = blockUserSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Dados inválidos', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    const { durationDays, reason } = parsed.data;
    const user = await adminService.blockUser(id, adminId, durationDays, reason);
    sendSuccess(res, user, 'Usuario bloqueado com sucesso!');
  }

  async unblockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const adminId = String(req.user!.userId);
    const user = await adminService.unblockUser(id, adminId);
    sendSuccess(res, user, 'Usuario desbloqueado com sucesso!');
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const adminId = String(req.user!.userId);
    const result = await adminService.deleteUser(id, adminId);
    sendSuccess(res, result, 'Usuario excluido com sucesso!');
  }

  async getUserHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const logs = await adminService.getUserHistory(id);
    sendSuccess(res, logs);
  }

  async getServiceRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.getServiceRequests(page, limit);
    sendSuccess(res, result);
  }

  async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.getOrders(page, limit);
    sendSuccess(res, result);
  }

  async getPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.getPayments(page, limit);
    sendSuccess(res, result);
  }

  async getDisputes(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page, limit } = parsePagination(req.query);
    const result = await adminService.getDisputes(page, limit);
    sendSuccess(res, result);
  }

  async updateDisputeStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const parsed = updateDisputeStatusSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Dados inválidos', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    const { status, adminNotes } = parsed.data;
    const dispute = await adminService.updateDisputeStatus(id, status as DisputeStatus, adminNotes, req.user!.userId);
    sendSuccess(res, dispute, 'Status da disputa atualizado com sucesso!');
  }
}

export const adminController = new AdminController();
