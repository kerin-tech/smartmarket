// src/services/analytics.service.ts

import api from './api';
import type {
  MonthlyAnalyticsResponse,
  SummaryResponse,
  ByStoreResponse,
  ByCategoryResponse,
  PriceComparisonResponse,
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
   * @param month - Mes específico (formato YYYY-MM, opcional)
   */
  async getSummary(month?: string): Promise<SummaryResponse> {
    const response = await api.get<ApiSuccessResponse<SummaryResponse>>(
      '/analytics/summary',
      { params: month ? { month } : {} }
    );
    return response.data.data;
  },

  /**
   * Obtener gastos por tienda
   * @param options - Opciones de filtro
   */
  async getByStore(options?: { months?: number; month?: string }): Promise<ByStoreResponse> {
    const params: Record<string, any> = {};
    if (options?.month) {
      params.month = options.month;
    } else if (options?.months) {
      params.months = options.months;
    }
    
    const response = await api.get<ApiSuccessResponse<ByStoreResponse>>(
      '/analytics/by-store',
      { params }
    );
    return response.data.data;
  },

  /**
   * Obtener gastos por categoría
   * @param options - Opciones de filtro
   */
  async getByCategory(options?: { months?: number; month?: string }): Promise<ByCategoryResponse> {
    const params: Record<string, any> = {};
    if (options?.month) {
      params.month = options.month;
    } else if (options?.months) {
      params.months = options.months;
    }
    
    const response = await api.get<ApiSuccessResponse<ByCategoryResponse>>(
      '/analytics/by-category',
      { params }
    );
    return response.data.data;
  },

  /**
   * Comparar precios de un producto en diferentes tiendas
   * @param productId - ID del producto
   */
  async comparePrices(productId: string): Promise<PriceComparisonResponse> {
    const response = await api.get<ApiSuccessResponse<PriceComparisonResponse>>(
      '/analytics/compare-prices',
      { params: { productId } }
    );
    return response.data.data;
  },
};