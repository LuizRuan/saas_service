import { api } from './api';
import type { Category } from '../types/category';

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await api.get('/categories');
    const payload = data as { categories: Category[] };
    return payload.categories;
  },
};
