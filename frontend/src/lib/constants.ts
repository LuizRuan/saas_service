import type { Urgency } from '@/types';

export const URGENCY_CONFIG: Record<Urgency, { label: string; cls: string }> = {
  low:    { label: 'Baixa', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Média', cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'  },
  high:   { label: 'Alta',  cls: 'text-red-400     bg-red-500/10     border-red-500/20'    },
};

export const getCategoryName = (categoryId: string | { name: string } | null | undefined): string => {
  if (!categoryId) return '—';
  if (typeof categoryId === 'object' && 'name' in categoryId) return categoryId.name;
  return String(categoryId);
};
