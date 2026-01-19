// src/components/ui/Badge.tsx

import { cn } from '@/lib/utils';
import type { CategoryKey } from '@/config/app.config';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: CategoryKey;
  showEmoji?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  info: 'bg-info-100 text-info-700',
};

const categoryStyles: Record<CategoryKey, string> = {
  fruits: 'bg-category-fruits-light text-category-fruits-dark',
  vegetables: 'bg-category-vegetables-light text-category-vegetables-dark',
  grains: 'bg-category-grains-light text-category-grains-dark',
  dairy: 'bg-category-dairy-light text-category-dairy-dark',
  meats: 'bg-category-meats-light text-category-meats-dark',
  beverages: 'bg-category-beverages-light text-category-beverages-dark',
  cleaning: 'bg-category-cleaning-light text-category-cleaning-dark',
  other: 'bg-category-other-light text-category-other-dark',
};

const categoryEmojis: Record<CategoryKey, string> = {
  fruits: '🍎',
  vegetables: '🥬',
  grains: '🍚',
  dairy: '🥛',
  meats: '🥩',
  beverages: '🥤',
  cleaning: '🧹',
  other: '📦',
};

const categoryLabels: Record<CategoryKey, string> = {
  fruits: 'Frutas',
  vegetables: 'Verduras',
  grains: 'Granos',
  dairy: 'Lácteos',
  meats: 'Carnes',
  beverages: 'Bebidas',
  cleaning: 'Limpieza',
  other: 'Otros',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
};

export function Badge({ className, variant = 'primary', size = 'md', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
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
  showEmoji = true,
  size = 'md',
  ...props
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        categoryStyles[category],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showEmoji && <span>{categoryEmojis[category]}</span>}
      <span>{categoryLabels[category]}</span>
    </span>
  );
}
