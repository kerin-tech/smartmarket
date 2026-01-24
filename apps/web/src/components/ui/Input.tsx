// src/components/ui/Input.tsx

'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              disabled ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            disabled={disabled}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-card px-3 py-2 text-sm transition-colors',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20',
              disabled && 'cursor-not-allowed bg-muted text-muted-foreground',
              isPassword && 'pr-11',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors',
                'hover:text-muted-foreground focus:outline-none focus:text-muted-foreground',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
