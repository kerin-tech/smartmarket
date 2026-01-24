// src/components/features/history/TrendChart.tsx

'use client';

import { formatCurrency } from '@/utils/formatters';
import type { MonthlyData } from '@/types/analytics.types';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: MonthlyData[];
  currentMonth: string;
  isLoading?: boolean;
  onMonthClick?: (month: string) => void; // Prop añadida para interactividad
}

export function TrendChart({ data, currentMonth, isLoading, onMonthClick }: TrendChartProps) {
  if (isLoading) {
    return <TrendChartSkeleton />;
  }

  // Ordenar de más antiguo a más reciente y tomar últimos 6
  const chartData = [...data]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  if (chartData.length < 2) {
    return (
      <div className="bg-card rounded-xl border border-color p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Tendencia (últimos 6 meses)
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          Se necesitan al menos 2 meses de datos para mostrar la tendencia
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map((d) => d.totalSpent), 1);

  const getShortMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const label = date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <div className="bg-card rounded-xl border border-color p-6">
      <h3 className="text-base font-semibold text-foreground mb-6">
        Tendencia (últimos 6 meses)
      </h3>

      {/* Gráfico de barras */}
      <div className="flex items-end justify-between gap-2 h-40 mb-4">
        {chartData.map((item) => {
          const height = maxValue > 0 ? (item.totalSpent / maxValue) * 100 : 0;
          const isSelected = item.month === currentMonth;

          return (
            <button // Cambiado de div a button para accesibilidad y clics
              key={item.month}
              onClick={() => onMonthClick?.(item.month)}
              className="flex-1 flex flex-col items-center gap-2 group outline-none"
              type="button"
            >
              {/* Valor superior */}
              <span className={cn(
                'text-[10px] sm:text-xs font-medium transition-colors duration-300',
                isSelected ? 'text-primary-600' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {item.totalSpent > 0 ? formatCurrency(item.totalSpent) : '-'}
              </span>
              
              {/* Contenedor de Barra */}
              <div className="w-full flex justify-center items-end h-full">
                <div
                  className={cn(
                    'w-full max-w-12 rounded-t-md transition-all duration-500 ease-out',
                    isSelected 
                      ? 'bg-primary-500 shadow-[0_-4px_12px_rgba(var(--primary-500),0.2)]' 
                      : 'bg-secondary-200 group-hover:bg-secondary-300'
                  )}
                  style={{ height: `${Math.max(height, 6)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Labels de meses */}
      <div className="flex justify-between gap-2 pt-2 border-t border-color">
        {chartData.map((item) => {
          const isSelected = item.month === currentMonth;
          return (
            <button
              key={item.month}
              onClick={() => onMonthClick?.(item.month)}
              className={cn(
                'flex-1 text-center text-xs font-medium capitalize transition-colors outline-none',
                isSelected ? 'text-primary-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {getShortMonth(item.month)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrendChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-color p-6">
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
      <div className="flex justify-between gap-2 pt-2 border-t border-color">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 flex justify-center">
            <div className="w-8 h-3 bg-secondary-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}