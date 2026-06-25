import mongoose, { Schema, Document, Types } from 'mongoose';
import { Urgency, ServiceRequestStatus } from '../types';

export interface IServiceRequest extends Document {
  clientId: Types.ObjectId;
  categoryId: Types.ObjectId;
  city: string;
  neighborhood: string;
  approximateAddress: string;
  fullAddress: string;
  description: string;
  photos: string[];
  desiredDate: Date;
  urgency: Urgency;
  status: ServiceRequestStatus;
  selectedProviderId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    city: {
      type: String,
      required: [true, 'Cidade é obrigatória'],
      trim: true,
    },
    neighborhood: {
      type: String,
      trim: true,
      default: '',
    },
    approximateAddress: {
      type: String,
      trim: true,
      default: '',
    },
    fullAddress: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Descrição do serviço é obrigatória'],
      trim: true,
      minlength: [10, 'Descrição deve ter pelo menos 10 caracteres'],
      maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres'],
    },
    photos: [{ type: String }],
    desiredDate: {
      type: Date,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'open',
        'quoted',
        'scheduled',
        'in_progress',
        'waiting_approval',
        'completed',
        'cancelled',
        'dispute',
      ],
      default: 'open',
    },
    selectedProviderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

serviceRequestSchema.index({ clientId: 1 });
serviceRequestSchema.index({ categoryId: 1 });
serviceRequestSchema.index({ city: 1, status: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ selectedProviderId: 1 });

export const ServiceRequest = mongoose.model<IServiceRequest>(
  'ServiceRequest',
  serviceRequestSchema
);
