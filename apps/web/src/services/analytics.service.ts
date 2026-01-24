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
  async getByStore(options?: { month?: string }) {

  const response = await api.get('/analytics/by-store', { params: options });
  return response.data.data;
},

  /**
   * Obtener gastos por categoría
   * @param options - Opciones de filtro
   */
  async getByCategory({ month }: { month: string }) {
  const response = await api.get('/analytics/by-category', { params: { month } });
  // El controlador que te envié devuelve successResponse(res, { byCategory, grandTotal })
  // Por lo tanto, los datos están en response.data.data
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