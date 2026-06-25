import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/response';

class PaymentController {
  async simulateDeposit(req: AuthenticatedRequest, res: Response): Promise<void> {
    const orderId = String(req.params['orderId']);
    const payment = await paymentService.simulateDeposit(orderId, req.user!.userId);
    sendSuccess(res, payment, 'Depósito de 20% realizado com sucesso!', 201);
  }

  async simulateRemaining(req: AuthenticatedRequest, res: Response): Promise<void> {
    const orderId = String(req.params['orderId']);
    const payment = await paymentService.simulateRemaining(orderId, req.user!.userId);
    sendSuccess(res, payment, 'Pagamento do restante (80%) realizado com sucesso!', 201);
  }

  async getMy(req: AuthenticatedRequest, res: Response): Promise<void> {
    const payments = await paymentService.getMy(req.user!.userId, req.user!.role);
    sendSuccess(res, payments);
  }
}

export const paymentController = new PaymentController();
