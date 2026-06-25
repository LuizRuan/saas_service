import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  orderId: Types.ObjectId;
  clientId: Types.ObjectId;
  providerId: Types.ObjectId;
  rating: number;
  comment: string;
  punctuality: number;
  quality: number;
  communication: number;
  cleanliness: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
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
    rating: {
      type: Number,
      required: [true, 'Nota geral é obrigatória'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Comentário deve ter no máximo 1000 caracteres'],
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
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

reviewSchema.index({ orderId: 1 });
reviewSchema.index({ providerId: 1 });
reviewSchema.index({ clientId: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
