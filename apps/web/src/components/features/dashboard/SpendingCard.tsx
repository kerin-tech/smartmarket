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
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getVariationColor = () => {
    switch (variation.direction) {
      case 'up':
        // Uso de variables semánticas: Danger para gasto excesivo
        return 'text-danger-700 bg-danger-100 dark:bg-danger-50/10 dark:text-danger-600';
      case 'down':
        // Uso de variables semánticas: Success para ahorro
        return 'text-success-700 bg-success-100 dark:bg-success-50/10 dark:text-success-600';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getVariationText = () => {
    if (variation.direction === 'equal') return 'Igual que el mes anterior';
    const symbol = variation.direction === 'up' ? '▲' : '▼';
    return `${symbol} ${variation.percentage}% vs mes anterior`;
  };

  return (
    <Link href="/history">
      {/* CAMBIO CLAVE: Usamos bg-card, border-border y text-foreground */}
      <div className="group relative overflow-hidden bg-card border border-border rounded-2xl p-6 shadow-soft hover:shadow-md transition-all cursor-pointer">
        
        {/* Decoración sutil: un gradiente muy suave en la esquina solo para dar identidad */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/10 transition-colors" />

        {/* Etiqueta con variable secundaria */}
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">
          Gasto este mes
        </p>

        {/* Mes actual */}
        <p className="text-secondary-500 text-sm mb-4 capitalize">{monthLabel}</p>

        {/* Total con color principal del tema */}
        <p className="text-4xl font-bold tracking-tight text-foreground mb-6">
          {formatCurrency(totalSpent)}
        </p>

        {/* Variación */}
        {previousMonthSpent > 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors',
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