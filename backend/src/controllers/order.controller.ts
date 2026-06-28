import { Response } from 'express';
import { AuthenticatedRequest, OrderStatus } from '../types';
import { orderService } from '../services/order.service';
import { sendSuccess } from '../utils/response';
import { buildFilePaths } from '../utils/upload';
import { parsePagination } from '../utils/pagination';
import { ValidationError } from '../utils/errors';
import { updateOrderStatusSchema, updateSignatureSchema } from '../schemas/order.schema';

class OrderController {
  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const pagination = parsePagination(req.query);
    const result = await orderService.getMy(req.user!.userId, req.user!.role, pagination);
    sendSuccess(res, result);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const order = await orderService.getById(id, req.user!.userId, req.user!.role);
    sendSuccess(res, order);
  }

  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Dados inválidos', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    const { status, scheduledDate } = parsed.data;
    const order = await orderService.updateStatus(id, status as OrderStatus, req.user!.userId, req.user!.role, scheduledDate);
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
    const parsed = updateSignatureSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Dados inválidos', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    const { type, signature } = parsed.data;
    const order = await orderService.updateSignature(id, type, signature, req.user!.userId);
    sendSuccess(res, order, 'Assinatura registrada com sucesso!');
  }

  async approveCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const order = await orderService.approveCompletion(id, req.user!.userId);
    sendSuccess(res, order, 'Serviço aprovado com sucesso! Realize o pagamento do restante.');
  }
}

export const orderController = new OrderController();
