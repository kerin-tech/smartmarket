// src/stores/store.store.ts

import { create } from 'zustand';
import type { Store } from '@/types/store.types';

interface StoreState {
  // Data
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  searchQuery: string;
  
  // Modal state
  isModalOpen: boolean;
  editingStore: Store | null;
  
  // Delete confirmation
  isDeleteModalOpen: boolean;
  deletingStore: Store | null;
  
  // Context menu
  menuOpenForId: string | null;

  // Actions
  setStores: (stores: Store[]) => void;
  addStore: (store: Store) => void;
  updateStore: (store: Store) => void;
  removeStore: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Modal actions
  openCreateModal: () => void;
  openEditModal: (store: Store) => void;
  closeModal: () => void;
  
  // Delete modal actions
  openDeleteModal: (store: Store) => void;
  closeDeleteModal: () => void;
  
  // Context menu actions
  openMenu: (storeId: string) => void;
  closeMenu: () => void;
}

export const useStoreStore = create<StoreState>((set) => ({
  stores: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  isModalOpen: false,
  editingStore: null,
  isDeleteModalOpen: false,
  deletingStore: null,
  menuOpenForId: null,

  setStores: (stores) => set({ stores }),
  addStore: (store) => set((state) => ({ stores: [store, ...state.stores] })),
  updateStore: (store) => set((state) => ({
    stores: state.stores.map((s) => (s.id === store.id ? store : s)),
  })),
  removeStore: (id) => set((state) => ({
    stores: state.stores.filter((s) => s.id !== id),
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  openCreateModal: () => set({ isModalOpen: true, editingStore: null, menuOpenForId: null }),
  openEditModal: (store) => set({ isModalOpen: true, editingStore: store, menuOpenForId: null }),
  closeModal: () => set({ isModalOpen: false, editingStore: null }),

  openDeleteModal: (store) => set({ isDeleteModalOpen: true, deletingStore: store, menuOpenForId: null }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deletingStore: null }),
  
  openMenu: (storeId) => set({ menuOpenForId: storeId }),
  closeMenu: () => set({ menuOpenForId: null }),
}));

// Selector para tiendas filtradas
export const useFilteredStores = () => {
  const stores = useStoreStore((state) => state.stores);
  const searchQuery = useStoreStore((state) => state.searchQuery);

  return stores.filter((store) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      store.name.toLowerCase().includes(query) ||
      store.location.toLowerCase().includes(query)
    );
  });
};