// src/services/store.service.ts

import api from './api';
import type { 
  Store, 
  CreateStoreRequest,
  UpdateStoreRequest,
  StoresResponse,
} from '@/types/store.types';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ApiStoreResponse {
  store: {
    id: string;
    name: string;
    location: string;
    createdAt: string;
  };
}

interface ApiStoresResponse {
  stores: Array<{
    id: string;
    name: string;
    location: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Mapear respuesta del backend al tipo del frontend
const mapStore = (backendStore: ApiStoreResponse['store']): Store => ({
  id: backendStore.id,
  name: backendStore.name,
  location: backendStore.location,
  createdAt: backendStore.createdAt,
});

export const storeService = {
  /**
   * Obtener todas las tiendas con paginación y filtros
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
  }): Promise<StoresResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const url = query ? `/stores?${query}` : '/stores';

    const response = await api.get<ApiSuccessResponse<ApiStoresResponse>>(url);

    return {
      stores: response.data.data.stores.map(mapStore),
      pagination: response.data.data.pagination,
    };
  },

  /**
   * Obtener tienda por ID
   */
  async getById(id: string): Promise<Store> {
    const response = await api.get<ApiSuccessResponse<ApiStoreResponse>>(
      `/stores/${id}`
    );
    return mapStore(response.data.data.store);
  },

  /**
   * Crear nueva tienda
   */
  async create(data: CreateStoreRequest): Promise<Store> {
    const response = await api.post<ApiSuccessResponse<ApiStoreResponse>>(
      '/stores',
      {
        name: data.name,
        location: data.location || '',
      }
    );
    return mapStore(response.data.data.store);
  },

  /**
   * Actualizar tienda
   */
  async update(id: string, data: UpdateStoreRequest): Promise<Store> {
    const response = await api.put<ApiSuccessResponse<ApiStoreResponse>>(
      `/stores/${id}`,
      data
    );
    return mapStore(response.data.data.store);
  },

  /**
   * Eliminar tienda
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/stores/${id}`);
  },
};