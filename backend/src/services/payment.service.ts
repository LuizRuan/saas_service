import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { Quote } from '../models/Quote';
import { AppError, ForbiddenError, NotFoundError } from '../utils/errors';
import { env } from '../config/env';
import { UserRole } from '../types';

function calcFees(amount: number) {
  const platformFee = Math.round(amount * env.PLATFORM_FEE_PERCENT) / 100;
  const providerAmount = Math.round((amount - platformFee) * 100) / 100;
  return { platformFee, providerAmount };
}

class PaymentService {
  async simulateDeposit(orderId: string, clientId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');
    if (order.clientId.toString() !== clientId) throw new ForbiddenError();

    if (['cancelled', 'completed'].includes(order.status)) {
      throw new AppError('Não é possível pagar depósito neste status da ordem', 400);
    }

    const existing = await Payment.findOne({ orderId, type: 'deposit', status: 'paid' });
    if (existing) throw new AppError('Depósito já foi pago para esta ordem', 409);

    const quote = await Quote.findById(order.quoteId);
    if (!quote) throw new NotFoundError('Orçamento');

    const amount = quote.depositAmount;
    const { platformFee, providerAmount } = calcFees(amount);

    const payment = await Payment.create({
      orderId,
      clientId,
      providerId: order.providerId,
      type: 'deposit',
      amount,
      platformFee,
      providerAmount,
      gateway: 'simulated',
      status: 'paid',
    });

    await Order.updateOne({ _id: orderId }, { status: 'scheduled' });

    return payment;
  }

  async simulateRemaining(orderId: string, clientId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Ordem de serviço');
    if (order.clientId.toString() !== clientId) throw new ForbiddenError();

    if (order.status !== 'completed') {
      throw new AppError('Serviço precisa estar concluído e aprovado para pagar o restante', 400);
    }

    const deposit = await Payment.findOne({ orderId, type: 'deposit', status: 'paid' });
    if (!deposit) throw new AppError('Depósito não encontrado', 400);

    const existing = await Payment.findOne({ orderId, type: 'remaining', status: 'paid' });
    if (existing) throw new AppError('Pagamento restante já foi realizado', 409);

    const quote = await Quote.findById(order.quoteId);
    if (!quote) throw new NotFoundError('Orçamento');

    const amount = quote.remainingAmount;
    const { platformFee, providerAmount } = calcFees(amount);

    const payment = await Payment.create({
      orderId,
      clientId,
      providerId: order.providerId,
      type: 'remaining',
      amount,
      platformFee,
      providerAmount,
      gateway: 'simulated',
      status: 'paid',
    });

    return payment;
  }

  async getMy(userId: string, role: UserRole) {
    const filter = role === 'client' ? { clientId: userId } : { providerId: userId };
    return Payment.find(filter)
      .populate('orderId', 'status serviceRequestId')
      .sort({ createdAt: -1 });
  }
}

export const paymentService = new PaymentService();
