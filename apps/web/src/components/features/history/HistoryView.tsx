// src/components/features/history/HistoryView.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';

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

// Obtener mes actual en formato YYYY-MM
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Formatear label de mes
const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export function HistoryView() {
  const { toasts, removeToast, error: showError } = useToast();

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryBreakdownType[]>([]);
  const [byStore, setByStore] = useState<StoreBreakdownType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Cargar datos
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [monthlyRes, categoryRes, storeRes] = await Promise.all([
        analyticsService.getMonthly(12),
        analyticsService.getByCategory(12),
        analyticsService.getByStore(12),
      ]);

      setMonthlyData(monthlyRes.monthly);
      setByCategory(categoryRes.byCategory);
      setByStore(storeRes.byStore);

      // Si el mes seleccionado no tiene datos, intentar seleccionar el mes más reciente con datos
      const hasDataInSelected = monthlyRes.monthly.some(
        (m) => m.month === selectedMonth && m.totalPurchases > 0
      );
      
      if (!hasDataInSelected) {
        const monthWithData = monthlyRes.monthly.find((m) => m.totalPurchases > 0);
        if (monthWithData) {
          setSelectedMonth(monthWithData.month);
        }
      }
    } catch (err: any) {
      showError(err.message || 'Error al cargar el historial');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Obtener datos del mes seleccionado
  const currentMonthData = monthlyData.find((m) => m.month === selectedMonth);
  
  // Calcular comparación con mes anterior
  const getComparison = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex === -1 || currentIndex === monthlyData.length - 1) {
      return null;
    }

    const current = monthlyData[currentIndex];
    const previous = monthlyData[currentIndex + 1];

    if (!previous || previous.totalSpent === 0) {
      return null;
    }

    const diff = current.totalSpent - previous.totalSpent;
    const percentage = Math.round((diff / previous.totalSpent) * 100);

    return {
      previousMonth: formatMonthLabel(previous.month).split(' ')[0], // Solo nombre del mes
      percentage: Math.abs(percentage),
      direction: (percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'equal') as 'up' | 'down' | 'equal',
    };
  };

  // Navegación de meses
  const handlePreviousMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex < monthlyData.length - 1) {
      setSelectedMonth(monthlyData[currentIndex + 1].month);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = monthlyData.findIndex((m) => m.month === selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(monthlyData[currentIndex - 1].month);
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

  // Verificar si hay algún historial
  const hasAnyHistory = monthlyData.some((m) => m.totalPurchases > 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>
        <HistorySkeleton />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Empty state - sin historial
  if (!hasAnyHistory) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>
        <HistoryEmptyState hasAnyHistory={false} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Empty state - mes sin datos
  if (!currentMonthData || currentMonthData.totalPurchases === 0) {
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
        <HistoryEmptyState
          monthLabel={formatMonthLabel(selectedMonth)}
          hasAnyHistory={hasAnyHistory}
        />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Historial</h1>

      {/* Selector de mes */}
      <MonthSelector
        currentMonth={selectedMonth}
        monthLabel={formatMonthLabel(selectedMonth)}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
        hasPrevious={hasPreviousMonth()}
        hasNext={hasNextMonth()}
      />

      {/* Card resumen */}
      <SummaryCard
        total={currentMonthData.totalSpent}
        purchaseCount={currentMonthData.totalPurchases}
        productCount={currentMonthData.totalItems}
        comparison={getComparison()}
      />

      {/* Grid de secciones (desktop: 2 columnas) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown categories={byCategory} />
        <StoreBreakdown stores={byStore} totalSpent={currentMonthData.totalSpent} />
      </div>

      {/* Gráfico de tendencia */}
      <TrendChart data={monthlyData} currentMonth={selectedMonth} />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}