// src/types/product.types.tsx

import { 
  Apple, Leaf, Wheat, Milk, Beef, CupSoda, Sparkles, Package,
  Refrigerator, Croissant, Fish, Egg, Wine, Bath, Dog, Baby,
  LucideIcon 
} from 'lucide-react';

// --- INTERFACES DE MODELO ---

export interface Product { 
  id: string;
  name: string;
  category: string;
  brand: string;
  createdAt: string;
  updatedAt?: string;
}

// --- INTERFACES DE API (Requests/Responses) ---

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

// Esta es la interfaz que estaba causando el error
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

// --- CONFIGURACIÓN DE CATEGORÍAS (UI) ---

export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const categoryConfig: Record<string, CategoryConfig> = {
  'Frutas': { label: 'Frutas', icon: Apple, color: 'text-primary-600' },
  'Verduras': { label: 'Verduras', icon: Leaf, color: 'text-primary-600' },
  'Granos': { label: 'Granos', icon: Wheat, color: 'text-primary-600' },
  'Lácteos': { label: 'Lácteos', icon: Milk, color: 'text-primary-600' },
  'Carnes': { label: 'Carnes', icon: Beef, color: 'text-primary-600' },
  'Bebidas': { label: 'Bebidas', icon: CupSoda, color: 'text-primary-600' },
  'Limpieza': { label: 'Limpieza', icon: Sparkles, color: 'text-primary-600' },
  'Otros': { label: 'Otros', icon: Package, color: 'text-primary-600' },
  'Despensa': { label: 'Despensa', icon: Refrigerator, color: 'text-primary-600' },
  'Panadería': { label: 'Panadería', icon: Croissant, color: 'text-primary-600' },
  'Pescados': { label: 'Pescados', icon: Fish, color: 'text-primary-600' },
  'Huevos': { label: 'Huevos', icon: Egg, color: 'text-primary-600' },
  'Licores': { label: 'Licores', icon: Wine, color: 'text-primary-600' },
  'Cuidado Personal': { label: 'Cuidado Personal', icon: Bath, color: 'text-primary-600' },
  'Mascotas': { label: 'Mascotas', icon: Dog, color: 'text-primary-600' },
  'Bebés': { label: 'Bebés', icon: Baby, color: 'text-primary-600' },
  'Congelados': { label: 'Congelados', icon: Package, color: 'text-primary-600' },
};

export const getCategoryConfig = (category: string) => {
  return categoryConfig[category] || { label: category, icon: Package, color: 'text-slate-500' };
};

export type CategoryKey = keyof typeof categoryConfig;