import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'waiting_approval', 'completed', 'cancelled']),
  scheduledDate: z.string().datetime({ offset: true }).optional(),
});

export const updateSignatureSchema = z.object({
  type: z.enum(['client', 'provider']),
  signature: z.string().min(1).max(100_000),
});
