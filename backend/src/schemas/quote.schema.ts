import { z } from 'zod';

export const createQuoteSchema = z.object({
  serviceRequestId: z.string().min(1, 'ID da solicitação é obrigatório'),
  totalAmount: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional().default(''),
  estimatedTime: z.string().optional().default(''),
  warrantyDays: z.number().int().min(0).optional().default(0),
});
