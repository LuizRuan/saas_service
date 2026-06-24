import mongoose, { Document, Schema, Types } from 'mongoose';
import { DisputeStatus } from '../types';

export interface IDispute extends Document {
  orderId: Types.ObjectId;
  openedBy: Types.ObjectId;
  reason: string;
  description: string;
  evidencePhotos: string[];
  status: DisputeStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    openedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidencePhotos: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved_client', 'resolved_provider', 'refunded'],
      default: 'open',
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

DisputeSchema.index({ orderId: 1 });
DisputeSchema.index({ status: 1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
