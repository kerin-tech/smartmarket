// src/components/ui/ChipGroup.tsx

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ChipOption {
  value: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(
  ({ options, value, onChange, label, error, disabled, className }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        {label && (
          <label className={cn(
            'block text-sm font-medium mb-2',
            disabled ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {label}
          </label>
        )}
        
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-1',
                value === option.value
                  ? 'bg-primary-600 text-white focus:ring-primary-500'
                  : 'bg-muted text-foreground hover:bg-secondary-200 focus:ring-secondary-400',
                disabled && 'opacity-50 cursor-not-allowed',
                error && value !== option.value && 'border border-error-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ChipGroup.displayName = 'ChipGroup';
