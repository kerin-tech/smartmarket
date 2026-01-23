// src/components/features/dashboard/SpendingCard.tsx

'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SpendingCardProps {
  totalSpent: number;
  previousMonthSpent: number;
  monthLabel: string;
}

export function SpendingCard({
  totalSpent,
  previousMonthSpent,
  monthLabel,
}: SpendingCardProps) {
  // Calcular variación porcentual
  const calculateVariation = () => {
    if (previousMonthSpent === 0) {
      return { percentage: 0, direction: 'equal' as const };
    }
    const diff = totalSpent - previousMonthSpent;
    const percentage = Math.round((diff / previousMonthSpent) * 100);
    return {
      percentage: Math.abs(percentage),
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'equal',
    } as const;
  };

  const variation = calculateVariation();

  const getVariationIcon = () => {
    switch (variation.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getVariationColor = () => {
    switch (variation.direction) {
      case 'up':
        return 'text-danger-600 bg-danger-50'; // Gastó más = rojo
      case 'down':
        return 'text-success-600 bg-success-50'; // Gastó menos = verde
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  };

  const getVariationText = () => {
    if (variation.direction === 'equal') {
      return 'Igual que el mes anterior';
    }
    const symbol = variation.direction === 'up' ? '▲' : '▼';
    return `${symbol} ${variation.percentage}% vs mes anterior`;
  };

  return (
    <Link href="/history">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
        {/* Etiqueta */}
        <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-2">
          Gasto este mes
        </p>

        {/* Mes actual */}
        <p className="text-primary-200 text-sm mb-3 capitalize">{monthLabel}</p>

        {/* Total */}
        <p className="text-4xl font-bold tracking-tight mb-4">
          {formatCurrency(totalSpent)}
        </p>

        {/* Variación */}
        {previousMonthSpent > 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              getVariationColor()
            )}
          >
            {getVariationIcon()}
            {getVariationText()}
          </span>
        )}
      </div>
    </Link>
  );
}