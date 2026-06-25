import { z } from 'zod';

export const registerClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
});

export const registerProviderSchema = registerClientSchema.extend({
  professionalName: z.string().optional(),
  document: z.string().optional().default(''),
  categories: z.array(z.string()).optional().default([]),
  cities: z.array(z.string()).optional().default([]),
  neighborhoods: z.array(z.string()).optional().default([]),
  bio: z.string().optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
});
