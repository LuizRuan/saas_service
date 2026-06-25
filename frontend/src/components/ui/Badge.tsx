import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'gray' | 'purple';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colors: Record<BadgeColor, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-slate-100 text-slate-600',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ color = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
