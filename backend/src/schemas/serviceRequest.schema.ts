import { z } from 'zod';

export const createServiceRequestSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().optional().default(''),
  approximateAddress: z.string().optional().default(''),
  fullAddress: z.string().optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(2000),
  urgency: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  desiredDate: z.string().optional(),
  desiredDateEnd: z.string().optional(),
  budget: z.number().positive().optional(),
});

export const updateServiceRequestSchema = z.object({
  status: z.enum(['open', 'quoted', 'scheduled', 'in_progress', 'waiting_approval', 'completed', 'cancelled', 'dispute']).optional(),
  description: z.string().min(10).max(2000).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  desiredDate: z.string().optional(),
});
