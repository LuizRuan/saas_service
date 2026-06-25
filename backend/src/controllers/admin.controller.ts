import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { adminService } from '../services/admin.service';
import { sendSuccess } from '../utils/response';
import { DisputeStatus } from '../types';

class AdminController {
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 20;
    const result = await adminService.getUsers(page, limit);
    sendSuccess(res, result);
  }

  async getProviders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 20;
    const result = await adminService.getProviders(page, limit);
    sendSuccess(res, result);
  }

  async approveProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const profile = await adminService.approveProvider(id);
    sendSuccess(res, profile, 'Prestador aprovado com sucesso!');
  }

  async blockProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const profile = await adminService.blockProvider(id);
    sendSuccess(res, profile, 'Prestador bloqueado com sucesso!');
  }

  async getServiceRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 20;
    const result = await adminService.getServiceRequests(page, limit);
    sendSuccess(res, result);
  }

  async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 20;
    const result = await adminService.getOrders(page, limit);
    sendSuccess(res, result);
  }

  async getPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 20;
    const result = await adminService.getPayments(page, limit);
    sendSuccess(res, result);
  }

  async getDisputes(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 20;
    const result = await adminService.getDisputes(page, limit);
    sendSuccess(res, result);
  }

  async updateDisputeStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const { status, adminNotes } = req.body;
    const dispute = await adminService.updateDisputeStatus(id, status as DisputeStatus, adminNotes);
    sendSuccess(res, dispute, 'Status da disputa atualizado com sucesso!');
  }
}

export const adminController = new AdminController();
