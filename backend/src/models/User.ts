import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '../types';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  city: string;
  state: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'E-mail inválido',
      },
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['client', 'provider', 'admin'],
      required: true,
      default: 'client',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Nota: email não precisa de index() explícito — o unique: true já cria o índice
userSchema.index({ role: 1, status: 1 });
userSchema.index({ city: 1, state: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
