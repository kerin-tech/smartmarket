// src/types/store.types.ts

export interface Store {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreFormData {
  name: string;
  location?: string;
}

export interface CreateStoreRequest {
  name: string;
  location?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  location?: string;
}

export interface StoresResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Sugerencias de locales comunes en Colombia
export const storeSuggestions = [
  { name: 'Éxito', icon: '🛒' },
  { name: 'Olímpica', icon: '🛒' },
  { name: 'Jumbo', icon: '🛒' },
  { name: 'D1', icon: '🏪' },
  { name: 'Ara', icon: '🏪' },
  { name: 'Carulla', icon: '🛒' },
  { name: 'Metro', icon: '🛒' },
  { name: 'Surtimax', icon: '🏪' },
  { name: 'Mercado local', icon: '🏬' },
  { name: 'Tienda de barrio', icon: '🏠' },
];