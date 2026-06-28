import { z } from 'zod';
import { DisputeStatus } from '../types';

export const blockUserSchema = z.object({
  durationDays: z.number().int().min(1).max(365),
  reason: z.string().min(1).max(500).optional(),
});

export const updateDisputeStatusSchema = z.object({
  status: z.enum(['open', 'under_review', 'resolved_client', 'resolved_provider', 'refunded'] as [DisputeStatus, ...DisputeStatus[]]),
  adminNotes: z.string().max(1000).optional(),
});
