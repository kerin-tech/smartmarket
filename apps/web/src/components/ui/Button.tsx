// src/components/ui/Button.tsx

'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      // Usa las nuevas variables semánticas: primary, primary-foreground y primary-hover
      primary:
        'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary/20 disabled:bg-primary/50',
      
      // Usa secondaryBtn (la que creamos para botones neutros)
      secondary:
        'bg-secondaryBtn text-secondaryBtn-foreground hover:bg-secondaryBtn-hover focus:ring-secondaryBtn/20 disabled:opacity-50',
      
      // Outline: Borde dinámico que usa el color border
      outline:
        'border-2 border-border bg-transparent text-foreground hover:bg-muted focus:ring-border/20 disabled:opacity-50',
      
      // Ghost: Sin fondo, solo cambia al hacer hover
      ghost:
        'text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-muted/20 disabled:opacity-50',
      
      // Danger: Usa la escala de peligro que configuramos (asegúrate de que en config sea "danger")
      danger:
        'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500/20 disabled:bg-danger-300 dark:disabled:bg-danger-900/50',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm gap-1.5',
      md: 'h-11 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando...</span>
          </div>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span className="truncate">{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };