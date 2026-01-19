// src/types/product.types.ts

export type CategoryKey = 
  | 'fruits' 
  | 'vegetables' 
  | 'meats' 
  | 'dairy' 
  | 'grains' 
  | 'beverages' 
  | 'cleaning' 
  | 'other';

export type UnitType = 'kg' | 'gr' | 'lt' | 'ml' | 'unidad';

export interface Product {
  id: string;
  name: string;
  category: CategoryKey;
  unit: UnitType;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  category: CategoryKey;
  unit: UnitType;
}

export interface CreateProductRequest {
  name: string;
  category: CategoryKey;
  unit: UnitType;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

// Configuración de categorías
export const categoryConfig: Record<CategoryKey, { label: string; emoji: string; color: string }> = {
  fruits: { label: 'Frutas', emoji: '🍎', color: 'orange' },
  vegetables: { label: 'Verduras', emoji: '🥬', color: 'green' },
  grains: { label: 'Granos', emoji: '🍚', color: 'yellow' },
  dairy: { label: 'Lácteos', emoji: '🥛', color: 'sky' },
  meats: { label: 'Carnes', emoji: '🥩', color: 'red' },
  beverages: { label: 'Bebidas', emoji: '🥤', color: 'violet' },
  cleaning: { label: 'Limpieza', emoji: '🧹', color: 'cyan' },
  other: { label: 'Otros', emoji: '📦', color: 'gray' },
};

// Configuración de unidades
export const unitConfig: Record<UnitType, { label: string; description: string }> = {
  kg: { label: 'kg', description: 'Kilogramos' },
  gr: { label: 'gr', description: 'Gramos' },
  lt: { label: 'lt', description: 'Litros' },
  ml: { label: 'ml', description: 'Mililitros' },
  unidad: { label: 'unidad', description: 'Unidad individual' },
};
