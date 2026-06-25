import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm hover:shadow-md',
  secondary:
    'bg-white text-primary border border-slate-200 hover:border-primary/30 hover:bg-primary-50 active:bg-primary-100 shadow-sm',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  success:
    'bg-success text-white hover:bg-success-dark active:bg-success-dark shadow-sm hover:shadow-md',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as any)}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </motion.button>
  );
}
