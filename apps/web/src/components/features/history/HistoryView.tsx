'use client';

import { useEffect, useState, useCallback, useMemo, Suspense, useRef } from 'react';
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
import { CreateListModal } from '@/components/features/shopping/CreateListModal'; 
import { shoppingListService } from '@/services/shoppingList.service'; 
import type { MonthlyData, CategoryBreakdown as CategoryBreakdownType, StoreBreakdown as StoreBreakdownType } from '@/types/analytics.types';
import type { CreateShoppingListRequest } from '@/types/shoppingList.types';

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
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

  // Estados de Datos
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryBreakdownType[]>([]);
  const [byStore, setByStore] = useState<StoreBreakdownType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(monthParam || getCurrentMonth());

  // ESTADOS PARA EL MODAL DE LISTA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | undefined>(undefined);
  const [isCreatingList, setIsCreatingList] = useState(false);

  const lastRequestedMonth = useRef<string | null>(null);

  // HANDLER: Recibe el ID de la compra para que el modal se encargue de la selección
  const handleQuickCreate = useCallback((purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setIsModalOpen(true);
  }, []);

  const handleCreateList = async (data: CreateShoppingListRequest) => {
    setIsCreatingList(true);
    try {
      await shoppingListService.create(data);
      showSuccess('Lista de compras creada exitosamente');
      setIsModalOpen(false);
      setSelectedPurchaseId(undefined);
    } catch (err: any) {
      showError(err.message || 'Error al crear la lista');
    } finally {
      setIsCreatingList(false);
    }
  };

  const loadMonthData = useCallback(async (month: string) => {
    lastRequestedMonth.current = month;
    setIsLoadingMonth(true); 

    try {
      const [categoryRes, storeRes] = await Promise.all([
        analyticsService.getByCategory({ month }),
        analyticsService.getByStore({ month }),
      ]);

      if (lastRequestedMonth.current === month) {
        setByCategory(categoryRes.byCategory);
        setByStore(storeRes.byStore);
      }
    } catch (err: any) {
      if (lastRequestedMonth.current === month) {
        showError(err.message || 'Error al cargar datos del mes');
      }
    } finally {
      if (lastRequestedMonth.current === month) {
        setIsLoadingMonth(false);
      }
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

  const handleMonthChange = (newMonth: string) => {
    if (newMonth === selectedMonth || isLoadingMonth) return;
    router.push(`/history?month=${newMonth}`, { scroll: false });
    setSelectedMonth(newMonth);
    loadMonthData(newMonth);
  };

  const currentMonthData = useMemo(() =>
    monthlyData.find((m) => m.month === selectedMonth),
    [monthlyData, selectedMonth]
  );

  const hasAnyHistory = useMemo(() => 
    monthlyData.some(m => m.totalPurchases > 0), 
    [monthlyData]
  );

  const comparisonData = useMemo(() => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    const current = monthlyData[currentIndex];
    const previous = monthlyData[currentIndex + 1];

    if (!current || !previous || previous.totalSpent === 0) return null;

    const diff = current.totalSpent - previous.totalSpent;
    const percentage = Math.round((Math.abs(diff) / previous.totalSpent) * 100);

    return {
      previousMonth: formatMonthLabel(previous.month),
      percentage,
      direction: diff > 0 ? 'up' as const : diff < 0 ? 'down' as const : 'equal' as const
    };
  }, [monthlyData, selectedMonth]);

  const handlePreviousMonth = () => {
    if (isLoadingMonth) return;
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex < monthlyData.length - 1) handleMonthChange(monthlyData[currentIndex + 1].month);
  };

  const handleNextMonth = () => {
    if (isLoadingMonth) return;
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex > 0) handleMonthChange(monthlyData[currentIndex - 1].month);
  };

  if (isLoading) return <HistorySkeleton />;

  return (
    <div className="min-h-screen space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Historial</h1>
        <MonthSelector
          currentMonth={selectedMonth}
          monthLabel={formatMonthLabel(selectedMonth)}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          hasPrevious={monthlyData.findIndex((m) => m.month === selectedMonth) < monthlyData.length - 1}
          hasNext={monthlyData.findIndex((m) => m.month === selectedMonth) > 0}
          disabled={isLoadingMonth}
        />
      </header>

      {(!currentMonthData || currentMonthData.totalPurchases === 0) ? (
        <HistoryEmptyState 
          monthLabel={formatMonthLabel(selectedMonth)} 
          hasAnyHistory={hasAnyHistory} 
        />
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
          <div className="w-full">
            <SummaryCard
              total={currentMonthData.totalSpent}
              purchaseCount={currentMonthData.totalPurchases}
              productCount={currentMonthData.totalItems}
              comparison={comparisonData}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="flex">
              {isLoadingMonth ? (
                <div className="w-full h-full min-h-[400px] bg-muted/50 animate-pulse rounded-3xl" />
              ) : (
                <div className="flex-1 [&>div]:h-full">
                  <CategoryBreakdown categories={byCategory as any} />
                </div>
              )}
            </div>

            <div className="flex">
              <div className="flex-1 [&>div]:h-full">
                <StoreBreakdown 
                  onQuickCreateList={handleQuickCreate} 
                  stores={byStore} 
                  totalSpent={currentMonthData?.totalSpent || 0} 
                  isLoading={isLoadingMonth}
                />
              </div>
            </div>
          </div>

          <div className="w-full pt-4">
            <TrendChart
              data={monthlyData}
              currentMonth={selectedMonth}
              onMonthClick={handleMonthChange}
            />
          </div>
        </div>
      )}

      {/* MODAL: Ahora recibe la prop initialPurchaseId */}
      <CreateListModal 
        isOpen={isModalOpen}
        isLoading={isCreatingList}
        initialPurchaseId={selectedPurchaseId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPurchaseId(undefined);
        }}
        onSubmit={handleCreateList}
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