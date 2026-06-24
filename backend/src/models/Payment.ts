import mongoose, { Document, Schema, Types } from 'mongoose';
import { PaymentType, PaymentGateway, PaymentStatus } from '../types';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  clientId: Types.ObjectId;
  providerId: Types.ObjectId;
  type: PaymentType;
  amount: number;
  platformFee: number;
  providerAmount: number;
  gateway: PaymentGateway;
  externalPaymentId?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'remaining', 'full'], required: true },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    providerAmount: { type: Number, required: true, min: 0 },
    gateway: { type: String, enum: ['simulated', 'mercado_pago', 'asaas', 'pagarme'], default: 'simulated' },
    externalPaymentId: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ clientId: 1 });
PaymentSchema.index({ providerId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
