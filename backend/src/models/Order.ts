import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus } from '../types';

export interface IOrder extends Document {
  serviceRequestId: Types.ObjectId;
  quoteId: Types.ObjectId;
  clientId: Types.ObjectId;
  providerId: Types.ObjectId;
  scheduledDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  status: OrderStatus;
  beforePhotos: string[];
  afterPhotos: string[];
  notes: string;
  clientSignature: string;
  providerSignature: string;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: 'Quote',
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
    scheduledDate: {
      type: Date,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['created', 'scheduled', 'in_progress', 'waiting_approval', 'completed', 'cancelled'],
      default: 'created',
    },
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    clientSignature: {
      type: String,
      default: '',
    },
    providerSignature: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
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

orderSchema.index({ serviceRequestId: 1 });
orderSchema.index({ clientId: 1 });
orderSchema.index({ providerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ clientId: 1, status: 1 });
orderSchema.index({ providerId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
