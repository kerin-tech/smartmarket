// src/services/purchase.service.ts

import api from './api';
import type { 
  Purchase, 
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchasesResponse,
  PurchaseFilters,
} from '@/types/purchase.types';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ApiPurchaseResponse {
  purchase: Purchase;
}

interface ApiPurchasesResponse {
  purchases: Purchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const purchaseService = {
  async getAll(params?: { 
    page?: number; 
    limit?: number;
  } & PurchaseFilters): Promise<PurchasesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.month) queryParams.append('month', params.month);
    if (params?.storeId) queryParams.append('storeId', params.storeId);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const url = query ? `/purchases?${query}` : '/purchases';

    const response = await api.get<ApiSuccessResponse<ApiPurchasesResponse>>(url);

    return {
      purchases: response.data.data.purchases,
      pagination: response.data.data.pagination,
    };
  },

  async getById(id: string): Promise<Purchase> {
    const response = await api.get<ApiSuccessResponse<ApiPurchaseResponse>>(
      `/purchases/${id}`
    );
    return response.data.data.purchase;
  },

  async create(data: CreatePurchaseRequest): Promise<Purchase> {
    const response = await api.post<ApiSuccessResponse<ApiPurchaseResponse>>(
      '/purchases',
      data
    );
    return response.data.data.purchase;
  },

  async update(id: string, data: UpdatePurchaseRequest): Promise<Purchase> {
    const response = await api.put<ApiSuccessResponse<ApiPurchaseResponse>>(
      `/purchases/${id}`,
      data
    );
    return response.data.data.purchase;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/purchases/${id}`);
  },
};