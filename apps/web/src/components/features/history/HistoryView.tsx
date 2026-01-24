'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { MonthSelector } from './MonthSelector';
import { SummaryCard } from './SummaryCard';
import { CategoryBreakdown } from './CategoryBreakdown';
import { StoreBreakdown } from './StoreBreakdown';
import { TrendChart } from './TrendChart';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HistorySkeleton } from './HistorySkeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { analyticsService } from '@/services/analytics.service';
import type {
  MonthlyData,
  CategoryBreakdown as CategoryBreakdownType,
  StoreBreakdown as StoreBreakdownType,
} from '@/types/analytics.types';

const formatMonthLabel = (monthKey: string) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export function HistoryView() {
  const { toasts, removeToast, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryBreakdownType[]>([]);
  const [byStore, setByStore] = useState<StoreBreakdownType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  // 1. Cargar datos detallados del mes
  const loadMonthData = useCallback(async (month: string) => {
    setIsLoadingMonth(true);
    try {
      // Limpiamos datos anteriores para evitar "flashes" de info vieja
      setByCategory([]);
      setByStore([]);

      const [categoryRes, storeRes] = await Promise.all([
        analyticsService.getByCategory({ month }),
        analyticsService.getByStore({ month }),
      ]);

      setByCategory(categoryRes.byCategory);
      setByStore(storeRes.byStore);
    } catch (err: any) {
      showError('Error al actualizar el desglose del mes');
    } finally {
      setIsLoadingMonth(false);
    }
  }, [showError]);

  // 2. Carga inicial del timeline
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const monthlyRes = await analyticsService.getMonthly(12);
        const history = monthlyRes.monthly;
        setMonthlyData(history);

        if (history.length > 0) {
          // Buscamos el mes más reciente que tenga compras
          const latestWithData = history.find(m => m.totalPurchases > 0) || history[0];
          setSelectedMonth(latestWithData.month);
          await loadMonthData(latestWithData.month);
        }
      } catch (err: any) {
        showError('Error al cargar historial');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [loadMonthData, showError]);

  // 3. Manejador de cambio de mes (Invocado por el selector y el gráfico)
  const handleMonthChange = async (newMonth: string) => {
    if (newMonth === selectedMonth) return;
    setSelectedMonth(newMonth);
    await loadMonthData(newMonth);
  };

  const currentMonthData = useMemo(() => 
    monthlyData.find((m) => m.month === selectedMonth),
    [monthlyData, selectedMonth]
  );
  
  const getComparison = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex === -1 || currentIndex === monthlyData.length - 1) return null;

    const current = monthlyData[currentIndex];
    const previous = monthlyData[currentIndex + 1];

    if (!previous || previous.totalSpent === 0) return null;

    const diff = current.totalSpent - previous.totalSpent;
    const percentage = Math.round((diff / previous.totalSpent) * 100);

    return {
      previousMonth: formatMonthLabel(previous.month).split(' ')[0],
      percentage: Math.abs(percentage),
      direction: (percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'equal') as 'up' | 'down' | 'equal',
    };
  };

  if (isLoading) return <HistorySkeleton />;

  const hasAnyHistory = monthlyData.some((m) => m.totalPurchases > 0);
  if (!hasAnyHistory) return <HistoryEmptyState hasAnyHistory={false} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>

      <MonthSelector
        currentMonth={selectedMonth}
        monthLabel={formatMonthLabel(selectedMonth)}
        onPrevious={() => {
          const idx = monthlyData.findIndex(m => m.month === selectedMonth);
          if (idx < monthlyData.length - 1) handleMonthChange(monthlyData[idx + 1].month);
        }}
        onNext={() => {
          const idx = monthlyData.findIndex(m => m.month === selectedMonth);
          if (idx > 0) handleMonthChange(monthlyData[idx - 1].month);
        }}
        hasPrevious={monthlyData.findIndex(m => m.month === selectedMonth) < monthlyData.length - 1}
        hasNext={monthlyData.findIndex(m => m.month === selectedMonth) > 0}
      />

      {(!currentMonthData || currentMonthData.totalPurchases === 0) ? (
        <HistoryEmptyState
          monthLabel={formatMonthLabel(selectedMonth)}
          hasAnyHistory={true}
        />
      ) : (
        <>
          <SummaryCard
            total={currentMonthData.totalSpent}
            purchaseCount={currentMonthData.totalPurchases}
            productCount={currentMonthData.totalItems}
            comparison={getComparison()}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {isLoadingMonth ? (
              <>
                <div className="bg-card rounded-xl border border-color p-6 h-[350px] animate-pulse" />
                <div className="bg-card rounded-xl border border-color p-6 h-[350px] animate-pulse" />
              </>
            ) : (
              <>
                <CategoryBreakdown categories={byCategory} />
                <StoreBreakdown 
                  stores={byStore} 
                  totalSpent={currentMonthData.totalSpent} 
                />
              </>
            )}
          </div>
        </>
      )}

      <TrendChart 
        data={monthlyData} 
        currentMonth={selectedMonth} 
        onMonthClick={handleMonthChange} // Asegúrate de que el TrendChart use esta prop
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}