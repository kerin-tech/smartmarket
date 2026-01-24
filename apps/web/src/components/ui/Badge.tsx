// src/components/ui/Badge.tsx

import { cn } from '@/lib/utils';
import { getCategoryConfig, type CategoryKey } from '@/types/product.types';
import { ShoppingCart } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: string; // Permitimos string para que no rompa con datos del backend
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-muted text-foreground',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ className, variant = 'primary', size = 'md', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({
  className,
  category,
  showIcon = true,
  size = 'md',
  ...props
}: CategoryBadgeProps) {
  const config = getCategoryConfig(category);
  const Icon = config.icon || ShoppingCart;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold bg-primary-50 text-primary-700 border border-primary-100/50',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      <span>{config.label}</span>
    </span>
  );
}