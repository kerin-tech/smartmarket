// src/stores/analytics.store.ts

import { create } from 'zustand';
import type {
  MonthlyData,
  MonthlySummary,
  CategoryBreakdown,
  StoreBreakdown,
} from '@/types/analytics.types';

interface AnalyticsState {
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Datos mensuales
  monthlyData: MonthlyData[];
  summary: MonthlySummary | null;
  
  // Datos por categoría y tienda
  byCategory: CategoryBreakdown[];
  byStore: StoreBreakdown[];
  
  // Mes seleccionado
  selectedMonth: string; // formato YYYY-MM
  
  // Acciones
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMonthlyData: (data: MonthlyData[]) => void;
  setSummary: (summary: MonthlySummary) => void;
  setByCategory: (data: CategoryBreakdown[]) => void;
  setByStore: (data: StoreBreakdown[]) => void;
  setSelectedMonth: (month: string) => void;
  reset: () => void;
}

// Obtener mes actual en formato YYYY-MM
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  isLoading: false,
  error: null,
  monthlyData: [],
  summary: null,
  byCategory: [],
  byStore: [],
  selectedMonth: getCurrentMonth(),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setMonthlyData: (data) => set({ monthlyData: data }),
  setSummary: (summary) => set({ summary }),
  setByCategory: (data) => set({ byCategory: data }),
  setByStore: (data) => set({ byStore: data }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  reset: () => set({
    isLoading: false,
    error: null,
    monthlyData: [],
    summary: null,
    byCategory: [],
    byStore: [],
    selectedMonth: getCurrentMonth(),
  }),
}));

// Selector para obtener datos del mes seleccionado
export const useSelectedMonthData = () => {
  const { monthlyData, selectedMonth } = useAnalyticsStore();
  return monthlyData.find((m) => m.month === selectedMonth) || null;
};

// Selector para obtener comparación con mes anterior
export const useMonthComparison = () => {
  const { monthlyData, selectedMonth } = useAnalyticsStore();
  
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
    previousMonth: previous.monthLabel,
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'equal',
  } as const;
};

// Selector para obtener meses disponibles
export const useAvailableMonths = () => {
  const { monthlyData } = useAnalyticsStore();
  return monthlyData
    .filter((m) => m.totalPurchases > 0)
    .map((m) => ({ value: m.month, label: m.monthLabel }));
};