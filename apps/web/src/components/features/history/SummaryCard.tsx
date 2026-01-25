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
      case 'up': return <TrendingUp className="h-5 w-5" />;
      case 'down': return <TrendingDown className="h-5 w-5" />;
      default: return <Minus className="h-5 w-5" />;
    }
  };

  const getComparisonColor = () => {
    if (!comparison) return '';
    switch (comparison.direction) {
      case 'up':
        return 'text-danger-700 bg-danger-100 ';
      case 'down':
        return 'text-success-600 bg-success-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getComparisonText = () => {
    if (!comparison) return null;
    if (comparison.direction === 'equal') return `Igual que el mes anterior`;
    const prefix = comparison.direction === 'up' ? '+' : '-';
    return `${prefix}${comparison.percentage}% vs mes anterior`;
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 text-foreground shadow-sm">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-sm font-black uppercase tracking-[0.2em] mb-2">
          Total del mes
        </p>
        <p className="text-5xl font-black tracking-tight text-foreground">
          {formatCurrency(total)}
        </p>
      </div>

      {comparison && (
        <div className="flex justify-center mb-8">
          <span className={cn(
            'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all tracking-wide',
            getComparisonColor()
          )}>
            {getComparisonIcon()}
            {getComparisonText()}
          </span>
        </div>
      )}

      <div className="flex justify-center gap-12 pt-8 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-black leading-none">{purchaseCount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">
              {purchaseCount === 1 ? 'compra' : 'compras'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-black leading-none">{productCount}</p>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">
              {productCount === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}