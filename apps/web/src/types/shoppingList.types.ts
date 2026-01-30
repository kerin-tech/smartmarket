// src/types/shoppingList.types.ts

export type ListFrequency = 'weekly' | 'biweekly' | 'monthly' | null;

export interface ShoppingListItem {
  id: string;
  productId: string;
  checked: boolean;
  product: {
    id: string;
    name: string;
    category: string;
    brand: string;
  };
}

export interface ShoppingList {
  id: string;
  name: string;
  frequency: ListFrequency;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
}

// Vista optimizada por tienda
export interface OptimizedProduct {
  itemId: string;
  productId: string;
  productName: string;
  brand: string;
  checked: boolean;
  bestPrice: number | null;
  lastPurchaseDate: string | null;
}

export interface OptimizedCategory {
  name: string;
  products: OptimizedProduct[];
}

export interface OptimizedStore {
  storeId: string;
  storeName: string;
  categories: OptimizedCategory[];
  total: number;
}

export interface OptimizedShoppingList {
  id: string;
  name: string;
  frequency: ListFrequency;
  stores: OptimizedStore[];
  grandTotal: number;
}

// Requests
export interface CreateShoppingListRequest {
  name: string;
  frequency?: ListFrequency;
  productIds: string[];
}

export interface DuplicateListRequest {
  name?: string;
}

// Frecuencias para UI
export const FREQUENCY_OPTIONS = [
  { value: '', label: 'Sin frecuencia' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
] as const;

export const getFrequencyLabel = (freq: ListFrequency): string => {
  const option = FREQUENCY_OPTIONS.find(o => o.value === (freq || ''));
  return option?.label || 'Sin frecuencia';
};