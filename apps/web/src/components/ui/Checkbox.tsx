// src/components/ui/Checkbox.tsx

'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'peer h-5 w-5 appearance-none rounded border bg-white transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500/20',
              'checked:bg-primary-600 checked:border-primary-600',
              error
                ? 'border-error-500'
                : 'border-secondary-300 hover:border-secondary-400',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            {...props}
          />
          <Check
            className={cn(
              'absolute left-0.5 top-0.5 h-4 w-4 text-white pointer-events-none',
              'opacity-0 peer-checked:opacity-100 transition-opacity'
            )}
            strokeWidth={3}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'ml-2.5 text-sm cursor-pointer select-none',
              disabled ? 'text-secondary-400 cursor-not-allowed' : 'text-secondary-700'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
