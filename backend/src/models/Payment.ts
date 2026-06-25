import mongoose, { Schema, Document, Types } from 'mongoose';
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
  externalPaymentId: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'remaining', 'full'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    providerAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    gateway: {
      type: String,
      enum: ['simulated', 'mercado_pago', 'asaas', 'pagarme'],
      default: 'simulated',
    },
    externalPaymentId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ clientId: 1 });
paymentSchema.index({ providerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gateway: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
