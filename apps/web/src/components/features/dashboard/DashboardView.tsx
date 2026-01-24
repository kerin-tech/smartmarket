// src/components/features/dashboard/DashboardView.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Package, MapPin, ShoppingCart, Wallet } from 'lucide-react';

import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardSkeleton } from './DashboardSkeleton';
import { SpendingCard } from './SpendingCard';
import { MetricCard } from './MetricCard';
import { MonthlyChart } from './MonthlyChart';
import { RecentPurchasesList } from './RecentPurchasesList';
import { ToastContainer } from '@/components/ui/Toast';

import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/auth.store';
import { dashboardService } from '@/services/dashboard.service';
import { formatCurrency } from '@/utils/formatters';
import type { DashboardSummary, MonthlyChartData } from '@/types/dashboard.types';
import type { Purchase } from '@/types/purchase.types';

// Obtener label del mes actual
const getCurrentMonthLabel = () => {
  const now = new Date();
  const label = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export function DashboardView() {
  const { toasts, removeToast, error: showError } = useToast();
  const { user } = useAuthStore();

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [hasPurchases, setHasPurchases] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<DashboardSummary | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyChartData[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);

  // Cargar datos
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primero verificar si tiene compras
      const hasData = await dashboardService.hasPurchases();
      setHasPurchases(hasData);

      if (hasData) {
        // Cargar todos los datos del dashboard
        const data = await dashboardService.loadDashboardData();
        setSummary(data.summary);
        setPreviousSummary(data.previousMonthSummary);
        setMonthlyChart(data.monthlyChart);
        setRecentPurchases(data.recentPurchases);
      }
    } catch (err: any) {
      showError(err.message || 'Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Obtener nombre del usuario
  const userName = user?.name || 'Usuario';
  const firstName = userName.split(' ')[0];

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Empty state
  if (!hasPurchases) {
    return (
      <div>
        <DashboardEmptyState userName={userName} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Dashboard con datos
  return (
    <div className="space-y-6">
      {/* Header: Saludo + Card gasto (en desktop lado a lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saludo */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Hola, {firstName} 👋
          </h1>
          <p className="text-muted-foreground capitalize">{getCurrentMonthLabel()}</p>
        </div>

        {/* Card de gasto principal */}
        {summary && (
          <SpendingCard
            totalSpent={summary.totalSpent}
            previousMonthSpent={previousSummary?.totalSpent || 0}
            monthLabel={getCurrentMonthLabel()}
          />
        )}
      </div>

      {/* Grid de métricas - 2 columnas mobile, 4 columnas desktop */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Productos"
            value={summary.totalProducts}
            icon={Package}
            href="/products"
          />
          <MetricCard
            title="Locales"
            value={summary.totalStores}
            icon={MapPin}
            href="/stores"
          />
          <MetricCard
            title="Compras"
            value={summary.totalPurchases}
            icon={ShoppingCart}
            href="/purchases"
          />
          <MetricCard
            title="Promedio"
            value={formatCurrency(summary.averagePerPurchase)}
            icon={Wallet}
          />
        </div>
      )}

      {/* Gráfico y Compras recientes - 1 columna mobile, 2 columnas desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de últimos 6 meses */}
        <MonthlyChart data={monthlyChart} />

        {/* Compras recientes */}
        <RecentPurchasesList purchases={recentPurchases} />
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}