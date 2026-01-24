'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Agregamos useRouter
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
  const router = useRouter(); // Para actualizar la URL al hacer clic
  const monthParam = searchParams.get('month');
  const { toasts, removeToast, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryBreakdownType[]>([]);
  const [byStore, setByStore] = useState<StoreBreakdownType[]>([]);
  
  // Iniciamos el estado con lo que venga en la URL o el mes actual
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

  // Carga inicial de la lista de meses
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const monthlyRes = await analyticsService.getMonthly(12);
        setMonthlyData(monthlyRes.monthly);
        
        // Cargar datos del mes seleccionado inicialmente
        await loadMonthData(selectedMonth);
      } catch (err: any) {
        showError(err.message || 'Error al cargar el historial');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [loadMonthData, showError]); // Se ejecuta solo al montar

  // CLAVE: Sincronizar estado LOCAL cuando la URL cambie (ej: desde el Dashboard)
  useEffect(() => {
    if (monthParam && monthParam !== selectedMonth) {
      setSelectedMonth(monthParam);
      loadMonthData(monthParam);
    }
  }, [monthParam, loadMonthData]); // Escuchamos cambios en la URL

  // Manejador central que actualiza AMBOS: Estado y URL
  const handleMonthChange = async (newMonth: string) => {
    if (newMonth === selectedMonth) return;
    
    // 1. Actualizamos URL (opcional, pero recomendado para consistencia)
    router.push(`/history?month=${newMonth}`, { scroll: false });
    
    // 2. Actualizamos estado local y cargamos datos
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

  if (isLoading) return <div className="space-y-6"><h1 className="text-2xl font-bold">Historial</h1><HistorySkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Historial</h1>
      
      <MonthSelector 
        currentMonth={selectedMonth} 
        monthLabel={formatMonthLabel(selectedMonth)} 
        onPrevious={handlePreviousMonth} 
        onNext={handleNextMonth} 
        hasPrevious={monthlyData.findIndex((m) => m.month === selectedMonth) < monthlyData.length - 1} 
        hasNext={monthlyData.findIndex((m) => m.month === selectedMonth) > 0} 
      />

      {(!currentMonthData || currentMonthData.totalPurchases === 0) ? (
        <HistoryEmptyState monthLabel={formatMonthLabel(selectedMonth)} hasAnyHistory={true} />
      ) : (
        <>
          <SummaryCard 
            total={currentMonthData.totalSpent} 
            purchaseCount={currentMonthData.totalPurchases} 
            productCount={currentMonthData.totalItems} 
            comparison={null} 
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {isLoadingMonth ? (
              <>
                <div className="bg-card rounded-xl border border-border p-6 h-[300px] animate-pulse" />
                <div className="bg-card rounded-xl border border-border p-6 h-[300px] animate-pulse" />
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

      {/* El TrendChart ahora usa el handleMonthChange corregido */}
      <TrendChart 
        data={monthlyData} 
        currentMonth={selectedMonth} 
        onMonthClick={handleMonthChange} 
      />
      
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