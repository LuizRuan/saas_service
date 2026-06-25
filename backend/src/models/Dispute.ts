import mongoose, { Schema, Document, Types } from 'mongoose';
import { DisputeStatus } from '../types';

export interface IDispute extends Document {
  orderId: Types.ObjectId;
  openedBy: Types.ObjectId;
  reason: string;
  description: string;
  evidencePhotos: string[];
  status: DisputeStatus;
  adminNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    openedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Motivo é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
      maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres'],
    },
    evidencePhotos: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved_client', 'resolved_provider', 'refunded'],
      default: 'open',
    },
    adminNotes: {
      type: String,
      trim: true,
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

disputeSchema.index({ orderId: 1 });
disputeSchema.index({ openedBy: 1 });
disputeSchema.index({ status: 1 });

export const Dispute = mongoose.model<IDispute>('Dispute', disputeSchema);
