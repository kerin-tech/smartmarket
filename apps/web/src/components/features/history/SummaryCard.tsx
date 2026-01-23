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
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getComparisonColor = () => {
    if (!comparison) return '';
    switch (comparison.direction) {
      case 'up':
        return 'text-danger-600 bg-danger-50';
      case 'down':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-secondary-600 bg-secondary-100';
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
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
      {/* Total */}
      <div className="text-center mb-4">
        <p className="text-primary-100 text-sm font-medium mb-1">Total del mes</p>
        <p className="text-4xl font-bold tracking-tight">{formatCurrency(total)}</p>
      </div>

      {/* Comparación */}
      {comparison && (
        <div className="flex justify-center mb-4">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              getComparisonColor()
            )}
          >
            {getComparisonIcon()}
            {getComparisonText()}
          </span>
        </div>
      )}

      {/* Estadísticas */}
      <div className="flex justify-center gap-6 pt-4 border-t border-primary-400/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-400/30 rounded-lg">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{purchaseCount}</p>
            <p className="text-xs text-primary-100">
              {purchaseCount === 1 ? 'compra' : 'compras'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-400/30 rounded-lg">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{productCount}</p>
            <p className="text-xs text-primary-100">
              {productCount === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}