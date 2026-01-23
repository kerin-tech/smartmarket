// src/types/purchase.types.ts

export interface PurchaseItemProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: PurchaseItemProduct;
}

export interface PurchaseStore {
  id: string;
  name: string;
  location: string;
}

export interface Purchase {
  id: string;
  date: string;
  createdAt: string;
  store: PurchaseStore;
  itemCount: number;
  total: number;
  items: PurchaseItem[];
}

// Para el formulario de crear/editar
export interface PurchaseItemFormData {
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: PurchaseItemProduct;
  tempId?: string;
}

export interface PurchaseFormData {
  storeId: string;
  date: string;
  items: PurchaseItemFormData[];
}

// Request al backend
export interface CreatePurchaseRequest {
  storeId: string;
  date: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdatePurchaseRequest {
  storeId?: string;
  date?: string;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

// Response del backend
export interface PurchasesResponse {
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

// Filtros
export interface PurchaseFilters {
  month?: string;
  storeId?: string;
  search?: string;
}

// Para agrupar compras por mes en UI
export interface PurchasesByMonth {
  monthKey: string;
  monthLabel: string;
  purchases: Purchase[];
  total: number;
}