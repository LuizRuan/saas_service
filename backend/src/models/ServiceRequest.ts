import mongoose, { Document, Schema, Types } from 'mongoose';
import { ServiceRequestStatus, ServiceRequestUrgency } from '../types';

export interface IServiceRequest extends Document {
  clientId: Types.ObjectId;
  categoryId: Types.ObjectId;
  city: string;
  neighborhood?: string;
  approximateAddress: string;
  fullAddress: string;
  description: string;
  photos: string[];
  desiredDate?: Date;
  urgency: ServiceRequestUrgency;
  status: ServiceRequestStatus;
  selectedProviderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    city: { type: String, required: true, trim: true },
    neighborhood: { type: String, trim: true },
    approximateAddress: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    photos: [{ type: String }],
    desiredDate: { type: Date },
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: {
      type: String,
      enum: ['open', 'quoted', 'scheduled', 'in_progress', 'waiting_approval', 'completed', 'cancelled', 'dispute'],
      default: 'open',
    },
    selectedProviderId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ServiceRequestSchema.index({ clientId: 1 });
ServiceRequestSchema.index({ categoryId: 1, city: 1, status: 1 });

export const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
