import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  orderId: Types.ObjectId;
  clientId: Types.ObjectId;
  providerId: Types.ObjectId;
  rating: number;
  comment?: string;
  punctuality: number;
  quality: number;
  communication: number;
  cleanliness: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    punctuality: { type: Number, required: true, min: 1, max: 5 },
    quality: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ReviewSchema.index({ providerId: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
