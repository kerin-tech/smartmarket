// src/components/features/history/SummaryCard.tsx

'use client';

import { TrendingUp, TrendingDown, Minus, ShoppingCart, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  total: number;
  purchaseCount: number;
  productCount: number;
  comparison: {
    previousMonth: string;
    percentage: number;
    direction: 'up' | 'down' | 'equal';
  } | null;
}

export function SummaryCard({
  total,
  purchaseCount,
  productCount,
  comparison,
}: SummaryCardProps) {
  const getComparisonIcon = () => {
    if (!comparison) return null;
    switch (comparison.direction) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getComparisonColor = () => {
    if (!comparison) return '';
    switch (comparison.direction) {
      case 'up':
        // Semántica: Danger para subida de gastos
        return 'bg-danger-100 text-danger-700 ';
      case 'down':
        // Semántica: Success para ahorro
        return 'bg-success-100 text-success-600 ';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getComparisonText = () => {
    if (!comparison) return null;
    if (comparison.direction === 'equal') {
      return `Igual que ${comparison.previousMonth}`;
    }
    const prefix = comparison.direction === 'up' ? '+' : '-';
    return `${prefix}${comparison.percentage}% vs ${comparison.previousMonth}`;
  };

  return (
    // CAMBIO: bg-card y border-border en lugar de gradiente
    <div className="bg-card border border-border rounded-2xl p-6 text-foreground shadow-soft">
      
      {/* Total */}
      <div className="text-center mb-6">
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">
          Total del mes
        </p>
        <p className="text-4xl font-extrabold tracking-tight text-foreground">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Comparación */}
      {comparison && (
        <div className="flex justify-center mb-6">
          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium transition-all',
              getComparisonColor()
            )}
          >
            {getComparisonIcon()}
            {getComparisonText()}
          </span>
        </div>
      )}

      {/* Estadísticas - CAMBIO: border-border y bg-muted/bg-primary-500/10 */}
      <div className="flex justify-center gap-8 pt-6 border-t border-border">
        
        {/* Compras */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 text-primary-500 rounded-xl">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">{purchaseCount}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
              {purchaseCount === 1 ? 'compra' : 'compras'}
            </p>
          </div>
        </div>

        {/* Productos */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 text-primary-500 rounded-xl">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">{productCount}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
              {productCount === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}