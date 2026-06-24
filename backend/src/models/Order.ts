import mongoose, { Document, Schema, Types } from 'mongoose';
import { OrderStatus } from '../types';

export interface IOrder extends Document {
  serviceRequestId: Types.ObjectId;
  quoteId: Types.ObjectId;
  clientId: Types.ObjectId;
  providerId: Types.ObjectId;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: OrderStatus;
  beforePhotos: string[];
  afterPhotos: string[];
  notes?: string;
  clientSignature?: string;
  providerSignature?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    serviceRequestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
    quoteId: { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending_payment', 'scheduled', 'in_progress', 'waiting_approval', 'completed', 'cancelled', 'dispute'],
      default: 'pending_payment',
    },
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    notes: { type: String },
    clientSignature: { type: String },
    providerSignature: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ clientId: 1, status: 1 });
OrderSchema.index({ providerId: 1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
