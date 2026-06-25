import mongoose from 'mongoose';
import { disputeService } from '../services/dispute.service';
import { Order } from '../models/Order';
import { ConflictError } from '../utils/errors';

const makeObjectId = () => new mongoose.Types.ObjectId();

describe('DisputeService', () => {
  let orderId: mongoose.Types.ObjectId;
  let clientId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    orderId = makeObjectId();
    clientId = makeObjectId();
    await Order.create({
      _id: orderId,
      serviceRequestId: makeObjectId(),
      clientId,
      providerId: makeObjectId(),
      quoteId: makeObjectId(),
      status: 'in_progress',
    });
  });

  it('cria disputa com sucesso', async () => {
    const dispute = await disputeService.create(
      { orderId: orderId.toString(), reason: 'Serviço não foi concluído', description: 'Detalhe do problema.' },
      clientId.toString(),
    );
    expect(dispute.orderId.toString()).toBe(orderId.toString());
  });

  it('lança ConflictError ao tentar criar segunda disputa para mesma ordem', async () => {
    await disputeService.create(
      { orderId: orderId.toString(), reason: 'Primeira disputa', description: 'Detalhe.' },
      clientId.toString(),
    );
    await expect(
      disputeService.create(
        { orderId: orderId.toString(), reason: 'Segunda disputa', description: 'Mais detalhes.' },
        clientId.toString(),
      )
    ).rejects.toThrow(ConflictError);
  });
});
