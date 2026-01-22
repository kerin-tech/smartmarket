// src/types/product.types.ts

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  brand?: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  brand?: string;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  brand?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Categorías predefinidas para el select
export const categoryOptions = [
  { value: 'Frutas', label: 'Frutas', emoji: '🍎' },
  { value: 'Verduras', label: 'Verduras', emoji: '🥬' },
  { value: 'Granos', label: 'Granos', emoji: '🍚' },
  { value: 'Lácteos', label: 'Lácteos', emoji: '🥛' },
  { value: 'Carnes', label: 'Carnes', emoji: '🥩' },
  { value: 'Bebidas', label: 'Bebidas', emoji: '🥤' },
  { value: 'Limpieza', label: 'Limpieza', emoji: '🧹' },
  { value: 'Otros', label: 'Otros', emoji: '📦' },
] as const;

// Configuración de categorías para UI
export const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  'Frutas': { label: 'Frutas', emoji: '🍎', color: 'orange' },
  'Verduras': { label: 'Verduras', emoji: '🥬', color: 'green' },
  'Granos': { label: 'Granos', emoji: '🍚', color: 'yellow' },
  'Lácteos': { label: 'Lácteos', emoji: '🥛', color: 'sky' },
  'Carnes': { label: 'Carnes', emoji: '🥩', color: 'red' },
  'Bebidas': { label: 'Bebidas', emoji: '🥤', color: 'violet' },
  'Limpieza': { label: 'Limpieza', emoji: '🧹', color: 'cyan' },
  'Otros': { label: 'Otros', emoji: '📦', color: 'gray' },
};

// Helper para obtener config de categoría (con fallback)
export const getCategoryConfig = (category: string) => {
  return categoryConfig[category] || { label: category, emoji: '📦', color: 'gray' };
};