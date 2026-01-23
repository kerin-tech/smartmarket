// src/components/features/history/TrendChart.tsx

'use client';

import { formatCurrency } from '@/utils/formatters';
import type { MonthlyData } from '@/types/analytics.types';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: MonthlyData[];
  currentMonth: string;
  isLoading?: boolean;
}

export function TrendChart({ data, currentMonth, isLoading }: TrendChartProps) {
  if (isLoading) {
    return <TrendChartSkeleton />;
  }

  // Ordenar de más antiguo a más reciente y tomar últimos 6
  const chartData = [...data]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-4">
          Tendencia (últimos 6 meses)
        </h3>
        <p className="text-sm text-secondary-500 text-center py-8">
          Se necesitan al menos 2 meses de datos para mostrar la tendencia
        </p>
      </div>
    );
  }

  // Encontrar el máximo para calcular alturas
  const maxValue = Math.max(...chartData.map((d) => d.totalSpent), 1);

  // Formatear etiqueta de mes corta (ej: "Ene")
  const getShortMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  };

  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-6">
      <h3 className="text-base font-semibold text-secondary-900 mb-6">
        Tendencia (últimos 6 meses)
      </h3>

      {/* Gráfico de barras */}
      <div className="flex items-end justify-between gap-2 h-40 mb-4">
        {chartData.map((item) => {
          const height = maxValue > 0 ? (item.totalSpent / maxValue) * 100 : 0;
          const isSelected = item.month === currentMonth;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-2"
            >
              {/* Valor */}
              <span className={cn(
                'text-xs font-medium transition-colors',
                isSelected ? 'text-primary-600' : 'text-secondary-500'
              )}>
                {item.totalSpent > 0 ? formatCurrency(item.totalSpent) : '-'}
              </span>
              
              {/* Barra */}
              <div className="w-full flex justify-center">
                <div
                  className={cn(
                    'w-full max-w-12 rounded-t-md transition-all duration-500',
                    isSelected ? 'bg-primary-500' : 'bg-secondary-200'
                  )}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  role="img"
                  aria-label={`${item.monthLabel}: ${formatCurrency(item.totalSpent)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels de meses */}
      <div className="flex justify-between gap-2 pt-2 border-t border-secondary-100">
        {chartData.map((item) => {
          const isSelected = item.month === currentMonth;
          return (
            <span
              key={item.month}
              className={cn(
                'flex-1 text-center text-xs font-medium capitalize transition-colors',
                isSelected ? 'text-primary-600' : 'text-secondary-500'
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

function TrendChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-6">
      <div className="h-5 w-48 bg-secondary-200 rounded animate-pulse mb-6" />
      <div className="flex items-end justify-between gap-2 h-40 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-12 h-3 bg-secondary-200 rounded animate-pulse" />
            <div
              className="w-full max-w-12 bg-secondary-200 rounded-t-md animate-pulse"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2 pt-2 border-t border-secondary-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 flex justify-center">
            <div className="w-8 h-3 bg-secondary-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}