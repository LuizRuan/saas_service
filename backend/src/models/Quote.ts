import mongoose, { Document, Schema, Types } from 'mongoose';
import { QuoteStatus } from '../types';

export interface IQuote extends Document {
  serviceRequestId: Types.ObjectId;
  providerId: Types.ObjectId;
  totalAmount: number;
  depositPercentage: number;
  depositAmount: number;
  remainingAmount: number;
  description: string;
  estimatedTime?: string;
  warrantyDays?: number;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    serviceRequestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    depositPercentage: { type: Number, default: 20 },
    depositAmount: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    estimatedTime: { type: String },
    warrantyDays: { type: Number, min: 0 },
    status: { type: String, enum: ['sent', 'accepted', 'rejected', 'expired'], default: 'sent' },
  },
  { timestamps: true }
);

QuoteSchema.index({ serviceRequestId: 1 });
QuoteSchema.index({ providerId: 1, status: 1 });

export const Quote = mongoose.model<IQuote>('Quote', QuoteSchema);
