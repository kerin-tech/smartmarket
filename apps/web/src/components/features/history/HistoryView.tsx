// src/components/features/history/HistoryView.tsx

'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import type { MonthlyData, CategoryBreakdown as CategoryBreakdownType, StoreBreakdown as StoreBreakdownType } from '@/types/analytics.types';

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

function HistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const monthParam = searchParams.get('month');
  const { toasts, removeToast, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryBreakdownType[]>([]);
  const [byStore, setByStore] = useState<StoreBreakdownType[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState(monthParam || getCurrentMonth());

  const loadMonthData = useCallback(async (month: string) => {
    setIsLoadingMonth(true);
    try {
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

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const monthlyRes = await analyticsService.getMonthly(12);
        setMonthlyData(monthlyRes.monthly);
        await loadMonthData(selectedMonth);
      } catch (err: any) {
        showError(err.message || 'Error al cargar el historial');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [loadMonthData, showError]);

  useEffect(() => {
    if (monthParam && monthParam !== selectedMonth) {
      setSelectedMonth(monthParam);
      loadMonthData(monthParam);
    }
  }, [monthParam, loadMonthData, selectedMonth]);

  const handleMonthChange = async (newMonth: string) => {
    if (newMonth === selectedMonth) return;
    router.push(`/history?month=${newMonth}`, { scroll: false });
    setSelectedMonth(newMonth);
    await loadMonthData(newMonth);
  };

  const currentMonthData = useMemo(() => 
    monthlyData.find((m) => m.month === selectedMonth),
    [monthlyData, selectedMonth]
  );

  const handlePreviousMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex < monthlyData.length - 1) handleMonthChange(monthlyData[currentIndex + 1].month);
  };

  const handleNextMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex > 0) handleMonthChange(monthlyData[currentIndex - 1].month);
  };

  if (isLoading) return <HistorySkeleton />;

  return (
    /* Eliminamos overflow-hidden para permitir scroll general */
    <div className="min-h-screen">
      {/* Header Fijo/Normal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Historial</h1>
        <MonthSelector 
          currentMonth={selectedMonth} 
          monthLabel={formatMonthLabel(selectedMonth)} 
          onPrevious={handlePreviousMonth} 
          onNext={handleNextMonth} 
          hasPrevious={monthlyData.findIndex((m) => m.month === selectedMonth) < monthlyData.length - 1} 
          hasNext={monthlyData.findIndex((m) => m.month === selectedMonth) > 0} 
        />
      </header>

      {(!currentMonthData || currentMonthData.totalPurchases === 0) ? (
        <HistoryEmptyState monthLabel={formatMonthLabel(selectedMonth)} hasAnyHistory={true} />
      ) : (
        /* DISPOSICIÓN MASONRY / DOS COLUMNAS CON UN SOLO SCROLL */
        <div className="columns-1 lg:columns-2 gap-4 space-y-8 [column-fill:_balance]">
          
          {/* Bloque 1: Resumen (Izquierda arriba) */}
          <div className="break-inside-avoid ">
            <SummaryCard 
              total={currentMonthData.totalSpent} 
              purchaseCount={currentMonthData.totalPurchases} 
              productCount={currentMonthData.totalItems} 
              comparison={null} 
            />
          </div>

          {/* Bloque 2: Categorías (Derecha arriba) */}
          <div className="break-inside-avoid ">
            {isLoadingMonth ? (
              <div className="h-[300px] bg-muted/50 animate-pulse rounded-3xl" />
            ) : (
              <CategoryBreakdown categories={byCategory as any} />
            )}
          </div>

          {/* Bloque 3: Trend Chart (Izquierda abajo) */}
          <div className="break-inside-avoid  ">
            {isLoadingMonth ? (
              <div className="h-[500px] bg-muted/50 animate-pulse rounded-3xl" />
            ) : (
              <StoreBreakdown stores={byStore} totalSpent={currentMonthData?.totalSpent || 0} />
            )}
          </div>
          
          {/* Bloque 4: Locales (Derecha abajo) */}
          <div className="break-inside-avoid ">
            <TrendChart 
              data={monthlyData} 
              currentMonth={selectedMonth} 
              onMonthClick={handleMonthChange} 
            />
          </div>


        </div>
      )}
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export function HistoryView() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryContent />
    </Suspense>
  );
}