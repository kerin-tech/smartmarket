'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
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
import type { MonthlyChartData } from '@/types/dashboard.types';

interface MonthlyChartProps {
  data: MonthlyChartData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const router = useRouter();

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime())
      .slice(-6)
      .map(item => ({
        ...item,
        shortLabel: new Date(item.month + '-02')
          .toLocaleDateString('es-CO', { month: 'short' })
          .replace('.', '')
          .toUpperCase(),
        totalSpent: Number(item.totalSpent)
      }));
  }, [data]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Últimos 6 meses</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">
          Últimos 6 meses
        </h3>
        <Link
          href="/history"
          className="text-sm font-medium text-primary-600 hover:opacity-80 flex items-center gap-1 transition-all"
        >
          Ver histórico
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="p-5 pt-8">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
              <XAxis 
                dataKey="shortLabel" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                width={40}
                tickFormatter={formatYAxis}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} 
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-foreground text-background text-[11px] font-bold px-3 py-1.5 rounded-md shadow-lg border-none">
                        {formatCurrency(payload[0].value as number)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="totalSpent" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
                onClick={(data) => {
                  if (data && data.month) {
                    router.push(`/history?month=${data.month}`);
                  }
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    className="cursor-pointer transition-opacity duration-300 hover:opacity-80"
                    fill={entry.month === currentMonth ? 'var(--primary)' : 'var(--color-muted-foreground)'}
                    fillOpacity={entry.month === currentMonth ? 1 : 0.25}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}