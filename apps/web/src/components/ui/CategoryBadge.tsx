// src/components/ui/CategoryBadge.tsx

import { cn } from '@/lib/utils';
import type { CategoryKey } from '@/types/product.types';

interface CategoryBadgeProps {
  category: CategoryKey;
  size?: 'sm' | 'md';
  showEmoji?: boolean;
  className?: string;
}

const categoryConfig: Record<CategoryKey, { label: string; emoji: string; className: string }> = {
  fruits: {
    label: 'Frutas',
    emoji: '🍎',
    className: 'bg-orange-100 text-orange-700',
  },
  vegetables: {
    label: 'Verduras',
    emoji: '🥬',
    className: 'bg-green-100 text-green-700',
  },
  meats: {
    label: 'Carnes',
    emoji: '🥩',
    className: 'bg-red-100 text-red-700',
  },
  dairy: {
    label: 'Lácteos',
    emoji: '🥛',
    className: 'bg-sky-100 text-sky-700',
  },
  grains: {
    label: 'Granos',
    emoji: '🍚',
    className: 'bg-yellow-100 text-yellow-700',
  },
  beverages: {
    label: 'Bebidas',
    emoji: '🥤',
    className: 'bg-violet-100 text-violet-700',
  },
  cleaning: {
    label: 'Limpieza',
    emoji: '🧹',
    className: 'bg-cyan-100 text-cyan-700',
  },
  other: {
    label: 'Otros',
    emoji: '📦',
    className: 'bg-gray-100 text-gray-700',
  },
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function CategoryBadge({
  category,
  size = 'md',
  showEmoji = true,
  className,
}: CategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.className,
        sizes[size],
        className
      )}
    >
      {showEmoji && <span>{config.emoji}</span>}
      <span>{config.label}</span>
    </span>
  );
}

export { categoryConfig };
