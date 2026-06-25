import { Response } from 'express';
import { AuthenticatedRequest, OrderStatus } from '../types';
import { orderService } from '../services/order.service';
import { sendSuccess } from '../utils/response';
import { buildFilePaths } from '../utils/upload';

class OrderController {
  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const orders = await orderService.getMy(req.user!.userId, req.user!.role);
    sendSuccess(res, orders);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const order = await orderService.getById(id, req.user!.userId, req.user!.role);
    sendSuccess(res, order);
  }

  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const { status } = req.body;
    const order = await orderService.updateStatus(id, status as OrderStatus, req.user!.userId, req.user!.role);
    sendSuccess(res, order, 'Status da ordem atualizado com sucesso!');
  }

  async updatePhotos(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const { type } = req.body;
    const files = (req.files as Express.Multer.File[]) ?? [];
    const paths = buildFilePaths(files, 'orders');
    const order = await orderService.updatePhotos(id, type as 'before' | 'after', paths, req.user!.userId);
    sendSuccess(res, order, 'Fotos adicionadas com sucesso!');
  }

  async updateSignature(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const { type, signature } = req.body;
    const order = await orderService.updateSignature(id, type as 'client' | 'provider', signature, req.user!.userId);
    sendSuccess(res, order, 'Assinatura registrada com sucesso!');
  }

  async approveCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const order = await orderService.approveCompletion(id, req.user!.userId);
    sendSuccess(res, order, 'Serviço aprovado com sucesso! Realize o pagamento do restante.');
  }
}

export const orderController = new OrderController();
