import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  professionalName: z.string().min(2).max(120).optional(),
  bio: z.string().max(2000).optional(),
  categories: z.array(z.string()).max(10).optional(),
  cities: z.array(z.string()).max(20).optional(),
  neighborhoods: z.array(z.string()).max(50).optional(),
});
