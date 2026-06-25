import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            'rounded-xl border px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 resize-y',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'hover:border-slate-400',
            error
              ? 'border-danger focus:ring-danger/20'
              : 'border-slate-200',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
