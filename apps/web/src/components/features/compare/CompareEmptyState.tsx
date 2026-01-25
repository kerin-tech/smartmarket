'use client';

import { Package, ShoppingBag, Store, FileText, Plus, Search, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Agregamos explícitamente los tipos que usa CompareView
type EmptyStateType = 'products' | 'stores' | 'purchases' | 'default' | 'initial' | 'no-history';

interface CompareEmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  productName?: string;
}

const icons: Record<EmptyStateType, React.ElementType> = {
  products: Package,
  stores: Store,
  purchases: ShoppingBag,
  default: FileText,
  initial: Search,
  'no-history': History,
};

const colors: Record<EmptyStateType, string> = {
  products: 'bg-muted text-primary-600',
  stores: 'bg-muted text-primary-600',
  purchases: 'bg-muted text-primary-600',
  default: 'bg-muted text-primary-600',
  initial: 'bg-muted text-primary-600',
  'no-history': 'bg-muted text-primary-600',
};

export function CompareEmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  className,
  productName,
}: CompareEmptyStateProps) {
  const Icon = icons[type];
  const colorClass = colors[type];

  // Textos automáticos para la vista de comparación
  const displayTitle = title || (
    type === 'initial' ? 'Comenzar comparación' : 
    type === 'no-history' ? 'Sin historial suficiente' : 
    'No hay datos'
  );

  const displayDescription = description || (
    type === 'initial' ? 'Busca y selecciona un producto arriba para ver la comparativa de precios.' :
    type === 'no-history' ? `Aún no tenemos registros suficientes para ${productName || 'este producto'}.` :
    'No se encontró la información.'
  );

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-20 px-4 text-center',
        'bg-card rounded-[2rem] border border-border shadow-sm',
        'animate-in fade-in zoom-in-95 duration-300',
        className
      )}
    >
      <div className={cn(
        'w-24 h-24 rounded-full flex items-center justify-center mb-8',
        colorClass
      )}>
        <Icon className="h-10 w-10" />
      </div>

      <h3 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">
        {displayTitle}
      </h3>
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
        {displayDescription}
      </p>

      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          size="lg"
          variant="outline"
          leftIcon={<Plus className="h-5 w-5" />}
          className="px-8"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}