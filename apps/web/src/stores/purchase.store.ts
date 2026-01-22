// src/stores/purchase.store.ts

import { create } from 'zustand';
import type { Purchase, PurchaseFilters, PurchasesByMonth } from '@/types/purchase.types';

interface PurchaseState {
  // Data
  purchases: Purchase[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: PurchaseFilters;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Modal state
  isModalOpen: boolean;
  editingPurchase: Purchase | null;
  
  // Delete confirmation
  isDeleteModalOpen: boolean;
  deletingPurchase: Purchase | null;

  // Actions
  setPurchases: (purchases: Purchase[]) => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (purchase: Purchase) => void;
  removePurchase: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: PurchaseState['pagination']) => void;
  setPage: (page: number) => void;
  setFilters: (filters: PurchaseFilters) => void;
  resetFilters: () => void;
  
  // Modal actions
  openCreateModal: () => void;
  openEditModal: (purchase: Purchase) => void;
  closeModal: () => void;
  
  // Delete modal actions
  openDeleteModal: (purchase: Purchase) => void;
  closeDeleteModal: () => void;
}

const initialFilters: PurchaseFilters = {
  month: undefined,
  storeId: undefined,
  search: undefined,
};

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

export const usePurchaseStore = create<PurchaseState>((set) => ({
  purchases: [],
  isLoading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  isModalOpen: false,
  editingPurchase: null,
  isDeleteModalOpen: false,
  deletingPurchase: null,

  setPurchases: (purchases) => set({ purchases }),
  addPurchase: (purchase) => set((state) => ({ 
    purchases: [purchase, ...state.purchases],
    pagination: { ...state.pagination, total: state.pagination.total + 1 }
  })),
  updatePurchase: (purchase) => set((state) => ({
    purchases: state.purchases.map((p) => (p.id === purchase.id ? purchase : p)),
  })),
  removePurchase: (id) => set((state) => ({
    purchases: state.purchases.filter((p) => p.id !== id),
    pagination: { ...state.pagination, total: state.pagination.total - 1 }
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  setPage: (page) => set((state) => ({ 
    pagination: { ...state.pagination, page } 
  })),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, page: 1 } // Reset page on filter change
  })),
  resetFilters: () => set({ filters: initialFilters, pagination: { ...initialPagination } }),

  openCreateModal: () => set({ isModalOpen: true, editingPurchase: null }),
  openEditModal: (purchase) => set({ isModalOpen: true, editingPurchase: purchase }),
  closeModal: () => set({ isModalOpen: false, editingPurchase: null }),

  openDeleteModal: (purchase) => set({ isDeleteModalOpen: true, deletingPurchase: purchase }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deletingPurchase: null }),
}));

/**
 * Selector para calcular el total de todas las compras visibles
 */
export const useTotalAmount = () => {
  const purchases = usePurchaseStore((state) => state.purchases);
  return purchases.reduce((sum, p) => sum + p.total, 0);
};

/**
 * Selector para agrupar compras por mes
 */
export const usePurchasesByMonth = (): PurchasesByMonth[] => {
  const purchases = usePurchaseStore((state) => state.purchases);
  
  const grouped = purchases.reduce((acc, purchase) => {
    const date = new Date(purchase.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      const monthLabel = date.toLocaleDateString('es-CO', {
        month: 'long',
        year: 'numeric',
      }).toUpperCase();
      
      acc[monthKey] = {
        monthKey,
        monthLabel,
        purchases: [],
        total: 0,
      };
    }
    
    acc[monthKey].purchases.push(purchase);
    acc[monthKey].total += purchase.total;
    
    return acc;
  }, {} as Record<string, PurchasesByMonth>);
  
  // Ordenar por mes (más reciente primero)
  return Object.values(grouped).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};