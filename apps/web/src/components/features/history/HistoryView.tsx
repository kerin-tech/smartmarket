// src/components/features/history/HistoryView.tsx

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

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (monthKey: string) => {
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
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Cargar datos de un mes específico (Memoized)
  const loadMonthData = useCallback(async (month: string) => {
    setIsLoadingMonth(true);
    try {
      // Importante: Asegurarse de que el servicio reciba el mes como string
      const [categoryRes, storeRes] = await Promise.all([
        analyticsService.getByCategory({ month }),
        analyticsService.getByStore({ month }),
      ]);

      setByCategory(categoryRes.byCategory);
      setByStore(storeRes.byStore);
    } catch (err: any) {
      showError(err.message || 'Error al cargar datos del mes');
    } finally {
      setIsLoadingMonth(false);
    }
  }, [showError]);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const monthlyRes = await analyticsService.getMonthly(12);
      setMonthlyData(monthlyRes.monthly);

      // Lógica de selección de mes con datos
      const hasDataInSelected = monthlyRes.monthly.some(
        (m) => m.month === selectedMonth && m.totalPurchases > 0
      );
      
      let monthToLoad = selectedMonth;
      if (!hasDataInSelected) {
        const monthWithData = monthlyRes.monthly.find((m) => m.totalPurchases > 0);
        if (monthWithData) {
          monthToLoad = monthWithData.month;
          setSelectedMonth(monthWithData.month);
        }
      }

      await loadMonthData(monthToLoad);
    } catch (err: any) {
      showError(err.message || 'Error al cargar el historial');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMonthData, showError]); // Eliminamos selectedMonth de aquí para evitar loops

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleMonthChange = async (newMonth: string) => {
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

  const handlePreviousMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex < monthlyData.length - 1) {
      handleMonthChange(monthlyData[currentIndex + 1].month);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex > 0) {
      handleMonthChange(monthlyData[currentIndex - 1].month);
    }
  };

  const hasPreviousMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    return currentIndex < monthlyData.length - 1;
  };

  const hasNextMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    return currentIndex > 0;
  };

  const hasAnyHistory = monthlyData.some((m) => m.totalPurchases > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>
        <HistorySkeleton />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  if (!hasAnyHistory) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>
        <HistoryEmptyState hasAnyHistory={false} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>

      <MonthSelector
        currentMonth={selectedMonth}
        monthLabel={formatMonthLabel(selectedMonth)}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
        hasPrevious={hasPreviousMonth()}
        hasNext={hasNextMonth()}
      />

      {(!currentMonthData || currentMonthData.totalPurchases === 0) ? (
        <HistoryEmptyState
          monthLabel={formatMonthLabel(selectedMonth)}
          hasAnyHistory={hasAnyHistory}
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
                <div className="bg-card rounded-xl border border-color p-6 h-[300px] animate-pulse" />
                <div className="bg-card rounded-xl border border-color p-6 h-[300px] animate-pulse" />
              </>
            ) : (
              <>
                <CategoryBreakdown categories={byCategory as any} />
                <StoreBreakdown stores={byStore} totalSpent={currentMonthData.totalSpent} />
              </>
            )}
          </div>
        </>
      )}

      <TrendChart data={monthlyData} currentMonth={selectedMonth} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}