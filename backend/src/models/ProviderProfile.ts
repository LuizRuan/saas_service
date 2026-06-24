import mongoose, { Document, Schema, Types } from 'mongoose';
import { ProviderStatus, ProviderPlan } from '../types';

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  professionalName: string;
  bio?: string;
  document?: string;
  categories: Types.ObjectId[];
  cities: string[];
  neighborhoods: string[];
  profileImage?: string;
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

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    professionalName: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    document: { type: String, trim: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    cities: [{ type: String, trim: true }],
    neighborhoods: [{ type: String, trim: true }],
    profileImage: { type: String },
    portfolioImages: [{ type: String }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedServices: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
    plan: { type: String, enum: ['free', 'pro', 'business', 'premium'], default: 'free' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProviderProfileSchema.index({ status: 1 });
ProviderProfileSchema.index({ cities: 1 });
ProviderProfileSchema.index({ categories: 1, status: 1 });

export const ProviderProfile = mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);
