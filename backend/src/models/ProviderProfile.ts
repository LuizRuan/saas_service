import mongoose, { Schema, Document, Types } from 'mongoose';
import { ProviderStatus, ProviderPlan } from '../types';

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  professionalName: string;
  bio: string;
  document: string;
  categories: Types.ObjectId[];
  cities: string[];
  neighborhoods: string[];
  profileImage: string;
  portfolioImages: string[];
  averageRating: number;
  totalReviews: number;
  completedServices: number;
  status: ProviderStatus;
  plan: ProviderPlan;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const providerProfileSchema = new Schema<IProviderProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    professionalName: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Bio deve ter no máximo 1000 caracteres'],
    },
    document: {
      type: String,
      trim: true,
      default: '',
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    cities: [{ type: String, trim: true }],
    neighborhoods: [{ type: String, trim: true }],
    profileImage: {
      type: String,
      default: '',
    },
    portfolioImages: [{ type: String }],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    completedServices: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'blocked'],
      default: 'pending',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'business', 'premium'],
      default: 'free',
    },
    verified: {
      type: Boolean,
      default: false,
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

// Nota: userId não precisa de index() explícito — o unique: true já cria o índice
providerProfileSchema.index({ status: 1 });
providerProfileSchema.index({ categories: 1 });
providerProfileSchema.index({ cities: 1 });
providerProfileSchema.index({ averageRating: -1 });

export const ProviderProfile = mongoose.model<IProviderProfile>(
  'ProviderProfile',
  providerProfileSchema
);
