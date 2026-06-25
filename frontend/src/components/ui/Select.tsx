import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-xl border bg-[#0d1530] px-4 py-2.5 text-sm text-white',
              'transition-all duration-200',
              'focus:outline-none focus:bg-[#111b3a]',
              'hover:border-white/15',
              '[color-scheme:dark]',
              error
                ? 'border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10'
                : 'border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled style={{ background: '#0d1530', color: 'rgba(255,255,255,0.3)' }}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: '#0d1530', color: '#fff' }}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-focus-within:text-white/60 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Animated glow */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: '0 0 0 3px rgba(59,130,246,0.08)' }} />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
