// src/components/ui/CategoryBadge.tsx

import { cn } from '@/lib/utils';
import type { CategoryKey } from '@/types/product.types';

interface CategoryBadgeProps {
  category: CategoryKey;
  size?: 'sm' | 'md';
  className?: string;
}

const categoryConfig: Record<CategoryKey, { label: string; emoji: string; className: string }> = {
  'Frutas': {
    label: 'Frutas',
    emoji: '🍎',
    className: 'bg-orange-100 text-orange-700',
  },
  'Verduras': {
    label: 'Verduras',
    emoji: '🥬',
    className: 'bg-green-100 text-green-700',
  },
  'Granos': {
    label: 'Granos',
    emoji: '🍚',
    className: 'bg-yellow-100 text-yellow-700',
  },
  'Lácteos': {
    label: 'Lácteos',
    emoji: '🥛',
    className: 'bg-sky-100 text-sky-700',
  },
  'Carnes': {
    label: 'Carnes',
    emoji: '🥩',
    className: 'bg-red-100 text-red-700',
  },
  'Bebidas': {
    label: 'Bebidas',
    emoji: '🥤',
    className: 'bg-violet-100 text-violet-700',
  },
  'Limpieza': {
    label: 'Limpieza',
    emoji: '🧹',
    className: 'bg-cyan-100 text-cyan-700',
  },
  'Otros': {
    label: 'Otros',
    emoji: '📦',
    className: 'bg-gray-100 text-gray-700',
  },
};

export function CategoryBadge({ category, size = 'md', className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig['Otros'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        config.className,
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}