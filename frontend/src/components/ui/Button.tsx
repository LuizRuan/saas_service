import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-primary-800 text-white hover:bg-primary-900 focus-visible:ring-primary-800',
  secondary: 'bg-surface-100 text-surface-800 hover:bg-surface-200 focus-visible:ring-surface-300',
  success: 'bg-trust-600 text-white hover:bg-trust-700 focus-visible:ring-trust-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  ghost: 'text-surface-700 hover:bg-surface-100 focus-visible:ring-surface-300',
  outline:
    'border border-primary-800 text-primary-800 hover:bg-primary-50 focus-visible:ring-primary-800',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" className="border-white border-t-white/40" /> : icon}
      {children}
    </button>
  );
}
