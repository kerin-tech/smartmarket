'use client';

import { Package, ShoppingBag, Store, FileText, Plus } from 'lucide-react';
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

// Colores actualizados para que coincidan con la nueva estética
const colors: Record<EmptyStateType, string> = {
  products: 'bg-muted text-primary-600',
  stores: 'bg-muted   text-primary-600',
  purchases: 'bg-muted text-primary-600',
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
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-20 px-4 text-center',
        'bg-card rounded-[2rem] border border-border shadow-sm',
        'animate-in fade-in zoom-in-95 duration-300',
        className
      )}
    >
      {/* Icon Container */}
      <div className={cn(
        'w-24 h-24 rounded-full flex items-center justify-center mb-8',
        colorClass
      )}>
        <Icon className="h-10 w-10" />
      </div>

      {/* Text Content */}
      <h3 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          size="lg"
          variant={'outline'}
          leftIcon={<Plus className="h-5 w-5" />}
          className={cn(
            "px-8",
            type !== 'default' && ""
          )}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}