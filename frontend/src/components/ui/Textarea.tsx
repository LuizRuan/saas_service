import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          <textarea
            ref={ref}
            id={textareaId}
            rows={4}
            className={cn(
              'w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20',
              'transition-all duration-200 resize-y',
              'focus:outline-none focus:bg-white/[0.08]',
              'hover:border-white/15',
              error
                ? 'border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10'
                : 'border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
              className
            )}
            {...props}
          />
          <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: '0 0 0 3px rgba(59,130,246,0.08)' }} />
        </div>
        {hint && !error && <p className="text-xs text-white/25">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
