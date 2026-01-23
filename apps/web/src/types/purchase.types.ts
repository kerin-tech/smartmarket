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
  unitPrice: number;        // Precio de lista (original)
  discountPercentage: number; 
  subtotal: number;         // (quantity * unitPrice) - descuento
  product: PurchaseItemProduct;
}

export interface PurchaseStore {
  id: string;
  name: string;
  location?: string; // Opcional si el backend no siempre lo envía
}

export interface Purchase {
  id: string;
  date: string;
  createdAt: string;
  store: PurchaseStore;
  itemCount: number;
  total: number;          // Total real pagado (con descuentos)
  totalBase?: number;    // Opcional
  totalSavings?: number; // Opcional
  items: PurchaseItem[];
}

// Para el formulario de crear/editar (Sincronizado con AddItemModal)
export interface PurchaseItemFormData {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number; // Cambiado a requerido para evitar errores en cálculos
  product?: PurchaseItemProduct;
  tempId?: string;
}

export interface PurchaseFormData {
  storeId: string;
  date: string;
  items: PurchaseItemFormData[];
}

// Request al backend (Lo que viaja por la red)
export interface CreatePurchaseRequest {
  storeId: string;
  date: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercentage: number; 
  }[];
}

export interface UpdatePurchaseRequest {
  storeId?: string;
  date?: string;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
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
  totalSavings?: number; // Opcional: para mostrar ahorro mensual
}