// src/components/features/dashboard/MonthlyChart.tsx

'use client';

import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';
import type { MonthlyChartData } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';

interface MonthlyChartProps {
  data: MonthlyChartData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Ordenar de más antiguo a más reciente
  const chartData = [...data].sort((a, b) => a.month.localeCompare(b.month));

  // Encontrar el máximo para calcular alturas
  const maxValue = Math.max(...chartData.map((d) => d.totalSpent), 1);

  // Mes actual para destacar
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Formatear etiqueta de mes corta (ej: "Ago")
  const getShortMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-color p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Últimos 6 meses
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-color p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Últimos 6 meses
      </h3>

      {/* Gráfico de barras */}
      <div className="flex items-end justify-between gap-2 h-44 mb-4">
        {chartData.map((item) => {
          const height = maxValue > 0 ? (item.totalSpent / maxValue) * 100 : 0;
          const isCurrentMonth = item.month === currentMonth;

          return (
            <Link
              key={item.month}
              href={`/history?month=${item.month}`}
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              {/* Valor (visible en hover o si es mes actual) */}
              <span
                className={cn(
                  'text-xs font-medium transition-opacity',
                  isCurrentMonth
                    ? 'text-primary-600 opacity-100'
                    : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                )}
              >
                {item.totalSpent > 0
                  ? item.totalSpent >= 1000000
                    ? `$${(item.totalSpent / 1000000).toFixed(1)}M`
                    : item.totalSpent >= 1000
                    ? `$${Math.round(item.totalSpent / 1000)}k`
                    : formatCurrency(item.totalSpent)
                  : '-'}
              </span>

              {/* Barra */}
              <div className="w-full flex justify-center">
                <div
                  className={cn(
                    'w-full max-w-12 rounded-t-md transition-all duration-300',
                    isCurrentMonth
                      ? 'bg-primary-500 group-hover:bg-primary-600'
                      : 'bg-secondary-200 group-hover:bg-secondary-300'
                  )}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  role="img"
                  aria-label={`${item.monthLabel}: ${formatCurrency(item.totalSpent)}`}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Labels de meses */}
      <div className="flex justify-between gap-2 pt-2 border-t border-color">
        {chartData.map((item) => {
          const isCurrentMonth = item.month === currentMonth;
          return (
            <span
              key={item.month}
              className={cn(
                'flex-1 text-center text-xs font-medium capitalize',
                isCurrentMonth ? 'text-primary-600' : 'text-muted-foreground'
              )}
            >
              {getShortMonth(item.month)}
            </span>
          );
        })}
      </div>
    </div>
  );
}