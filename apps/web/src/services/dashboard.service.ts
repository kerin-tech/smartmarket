// src/services/dashboard.service.ts

import api from './api';
import type { DashboardSummary, MonthlyChartData, TopProduct } from '@/types/dashboard.types';
import type { Purchase } from '@/types/purchase.types';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Obtener mes actual en formato YYYY-MM
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Obtener mes anterior en formato YYYY-MM
const getPreviousMonth = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const dashboardService = {
  /**
   * Obtener resumen del mes actual
   */
  async getCurrentMonthSummary(): Promise<DashboardSummary> {
    const month = getCurrentMonth();
    const response = await api.get<ApiSuccessResponse<DashboardSummary>>(
      '/analytics/summary',
      { params: { month } }
    );
    return response.data.data;
  },

  /**
   * Obtener resumen del mes anterior
   */
  async getPreviousMonthSummary(): Promise<DashboardSummary> {
    const month = getPreviousMonth();
    const response = await api.get<ApiSuccessResponse<DashboardSummary>>(
      '/analytics/summary',
      { params: { month } }
    );
    return response.data.data;
  },

  /**
   * Obtener datos para gráfico de últimos 6 meses
   */
  async getMonthlyChart(): Promise<MonthlyChartData[]> {
    const response = await api.get<ApiSuccessResponse<{ monthly: MonthlyChartData[] }>>(
      '/analytics/monthly',
      { params: { months: 6 } }
    );
    return response.data.data.monthly;
  },

  /**
   * Obtener top productos del mes
   */
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const month = getCurrentMonth();
    const response = await api.get<ApiSuccessResponse<{ topProducts: TopProduct[] }>>(
      '/analytics/top-products',
      { params: { limit, month } }
    );
    return response.data.data.topProducts;
  },

  /**
   * Obtener compras recientes
   */
  async getRecentPurchases(limit: number = 5): Promise<Purchase[]> {
    const response = await api.get<ApiSuccessResponse<any>>(
      '/purchases',
      { params: { limit, sortBy: 'date', sortOrder: 'desc' } }
    );
    const data = response.data.data;
    
    // Manejar diferentes estructuras
    if (Array.isArray(data.purchases)) {
      return data.purchases;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  },

  /**
   * Verificar si el usuario tiene compras
   */
  async hasPurchases(): Promise<boolean> {
    try {
      const response = await api.get<ApiSuccessResponse<any>>(
        '/purchases',
        { params: { limit: 1 } }
      );
      const data = response.data.data;
      
      // Manejar diferentes estructuras de respuesta
      if (data.total !== undefined) {
        return data.total > 0;
      }
      if (data.pagination?.total !== undefined) {
        return data.pagination.total > 0;
      }
      if (Array.isArray(data.purchases)) {
        return data.purchases.length > 0;
      }
      if (Array.isArray(data)) {
        return data.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking purchases:', error);
      return false;
    }
  },

  /**
   * Cargar todos los datos del dashboard
   */
  async loadDashboardData() {
    const [
      currentSummary,
      previousSummary,
      monthlyChart,
      topProducts,
      recentPurchases,
    ] = await Promise.all([
      this.getCurrentMonthSummary(),
      this.getPreviousMonthSummary(),
      this.getMonthlyChart(),
      this.getTopProducts(5),
      this.getRecentPurchases(5),
    ]);

    return {
      summary: currentSummary,
      previousMonthSummary: previousSummary,
      monthlyChart,
      topProducts,
      recentPurchases,
    };
  },
};