// src/services/analytics.service.ts

import api from './api';
import type {
  MonthlyAnalyticsResponse,
  SummaryResponse,
  ByStoreResponse,
  ByCategoryResponse,
} from '@/types/analytics.types';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const analyticsService = {
  /**
   * Obtener métricas mensuales
   * @param months - Número de meses a obtener (default: 6)
   */
  async getMonthly(months: number = 6): Promise<MonthlyAnalyticsResponse> {
    const response = await api.get<ApiSuccessResponse<MonthlyAnalyticsResponse>>(
      '/analytics/monthly',
      { params: { months } }
    );
    return response.data.data;
  },

  /**
   * Obtener resumen general
   */
  async getSummary(): Promise<SummaryResponse> {
    const response = await api.get<ApiSuccessResponse<SummaryResponse>>(
      '/analytics/summary'
    );
    return response.data.data;
  },

  /**
   * Obtener gastos por tienda
   * @param months - Número de meses a obtener (default: 6)
   */
  async getByStore(months: number = 6): Promise<ByStoreResponse> {
    const response = await api.get<ApiSuccessResponse<ByStoreResponse>>(
      '/analytics/by-store',
      { params: { months } }
    );
    return response.data.data;
  },

  /**
   * Obtener gastos por categoría
   * @param months - Número de meses a obtener (default: 6)
   */
  async getByCategory(months: number = 6): Promise<ByCategoryResponse> {
    const response = await api.get<ApiSuccessResponse<ByCategoryResponse>>(
      '/analytics/by-category',
      { params: { months } }
    );
    return response.data.data;
  },
};