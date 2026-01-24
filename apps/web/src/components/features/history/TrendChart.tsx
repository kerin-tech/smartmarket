'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import type { MonthlyData } from '@/types/analytics.types';

interface TrendChartProps {
  data: MonthlyData[];
  currentMonth: string;
  isLoading?: boolean;
  onMonthClick?: (month: string) => void;
}

export function TrendChart({ data, currentMonth, isLoading, onMonthClick }: TrendChartProps) {

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime())
      .slice(-6)
      .map(item => ({
        ...item,
        label: new Date(item.month + '-02').toLocaleDateString('es-CO', { month: 'short' }).toUpperCase(),
        totalSpent: Number(item.totalSpent)
      }));
  }, [data]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  if (isLoading) return <TrendChartSkeleton />;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-foreground text-background text-[11px] font-bold px-3 py-1.5 rounded-md shadow-xl border-none">
          {formatCurrency(payload[0].value)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
          Tendencia de Gasto
        </h3>
        <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Últimos 6 meses
        </span>
      </div>

      <div className="h-64 w-full">


        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={0.5}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 600 }}
              dy={10}
              // También hacemos que los labels del eje X sean clicables
              className="cursor-pointer"
              onClick={(data) => onMonthClick?.(chartData[data.index].month)}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={45}
              tickFormatter={formatYAxis}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
            />

            <Bar
              dataKey="totalSpent"
              radius={[4, 4, 0, 0]}
              barSize={32}
              animationDuration={1200}
              // MOVEMOS EL ONCLICK AQUÍ PARA MÁXIMA PRECISIÓN
              onClick={(data) => {
                if (data && data.month) {
                  onMonthClick?.(data.month);
                }
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="cursor-pointer transition-all duration-300 hover:opacity-80"
                  fill={entry.month === currentMonth
                    ? 'var(--primary)'
                    : 'var(--color-muted-foreground)'
                  }
                  fillOpacity={entry.month === currentMonth ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TrendChartSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 h-[340px]">
      <div className="h-4 w-32 bg-muted/40 animate-pulse rounded mb-10" />
      <div className="flex items-end justify-between gap-4 h-48 mt-12 px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-1 bg-muted/20 animate-pulse rounded-t-sm" style={{ height: `${15 * i}%` }} />
        ))}
      </div>
    </div>
  );
}