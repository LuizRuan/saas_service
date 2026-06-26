import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction = 'block_user' | 'unblock_user' | 'delete_user';

export interface IAuditLog extends Document {
  targetUserId: mongoose.Types.ObjectId;
  targetUserName: string;
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  action: AuditAction;
  reason?: string;
  blockedUntil?: Date;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    targetUserId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserName: { type: String, required: true },
    adminId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName:      { type: String, required: true },
    action: {
      type: String,
      enum: ['block_user', 'unblock_user', 'delete_user'],
      required: true,
    },
    reason:         { type: String },
    blockedUntil:   { type: Date },
    previousStatus: { type: String, required: true },
    newStatus:      { type: String, required: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ targetUserId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
