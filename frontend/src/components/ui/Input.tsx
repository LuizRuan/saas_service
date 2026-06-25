import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none group-focus-within:text-white/50 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20',
              'transition-all duration-200',
              'focus:outline-none focus:bg-white/[0.08]',
              'hover:border-white/15',
              icon && 'pl-10',
              error
                ? 'border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10'
                : 'border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
              // Date input fix for dark mode
              '[color-scheme:dark]',
              className
            )}
            {...props}
          />
          {/* Animated glow on focus */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.08)' : '0 0 0 3px rgba(59,130,246,0.08)' }} />
        </div>
        {hint && !error && <p className="text-xs text-white/25">{hint}</p>}
        {error && <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
