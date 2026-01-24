// src/components/ui/EmptyState.tsx

import { Package, ShoppingBag, Store, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

type EmptyStateType = 'products' | 'stores' | 'purchases' | 'default';

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const icons: Record<EmptyStateType, React.ElementType> = {
  products: Package,
  stores: Store,
  purchases: ShoppingBag,
  default: FileText,
};

const colors: Record<EmptyStateType, string> = {
  products: 'bg-primary-100 text-primary-600',
  stores: 'bg-warning-100 text-warning-600',
  purchases: 'bg-success-100 text-success-600',
  default: 'bg-muted text-muted-foreground',
};

export function EmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = icons[type];
  const colorClass = colors[type];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mb-4', colorClass)}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
