import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuoteStatus } from '../types';
import { env } from '../config/env';

export interface IQuote extends Document {
  serviceRequestId: Types.ObjectId;
  providerId: Types.ObjectId;
  totalAmount: number;
  depositPercentage: number;
  depositAmount: number;
  remainingAmount: number;
  description: string;
  estimatedTime: string;
  warrantyDays: number;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Valor total é obrigatório'],
      min: [1, 'Valor deve ser positivo'],
    },
    depositPercentage: {
      type: Number,
      default: () => env.DEPOSIT_PERCENT,
      immutable: true,
    },
    depositAmount: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedTime: {
      type: String,
      trim: true,
      default: '',
    },
    warrantyDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['sent', 'accepted', 'rejected', 'expired'],
      default: 'sent',
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

quoteSchema.index({ serviceRequestId: 1 });
quoteSchema.index({ providerId: 1 });
quoteSchema.index({ status: 1 });

// Calcula sinal com base em env.DEPOSIT_PERCENT
quoteSchema.pre('validate', function (next) {
  if (this.totalAmount) {
    const depositFraction = env.DEPOSIT_PERCENT / 100;
    this.depositPercentage = env.DEPOSIT_PERCENT;
    this.depositAmount = Math.round(this.totalAmount * depositFraction * 100) / 100;
    this.remainingAmount = Math.round((this.totalAmount - this.depositAmount) * 100) / 100;
  }
  next();
});

export const Quote = mongoose.model<IQuote>('Quote', quoteSchema);
