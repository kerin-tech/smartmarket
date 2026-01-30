// src/stores/shoppingList.store.ts

import { create } from 'zustand';
import type { ShoppingList, OptimizedShoppingList } from '@/types/shoppingList.types';

interface ShoppingListState {
  // Data
  lists: ShoppingList[];
  activeList: OptimizedShoppingList | null;
  isLoading: boolean;
  isLoadingActive: boolean;

  // Modals
  isCreateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  deletingList: ShoppingList | null;

  // Actions - Data
  setLists: (lists: ShoppingList[]) => void;
  setActiveList: (list: OptimizedShoppingList | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingActive: (loading: boolean) => void;
  addList: (list: ShoppingList) => void;
  removeList: (id: string) => void;

  // Actions - Toggle item in active list
  toggleItemInActive: (itemId: string) => void;

  // Actions - Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDeleteModal: (list: ShoppingList) => void;
  closeDeleteModal: () => void;
  syncActiveToLists: () => void;
}

export const useShoppingListStore = create<ShoppingListState>((set) => ({
  // Initial state
  lists: [],
  activeList: null,
  isLoading: false,
  isLoadingActive: false,
  isCreateModalOpen: false,
  isDeleteModalOpen: false,
  deletingList: null,

  // Data actions
  setLists: (lists) => set({ lists }),
  setActiveList: (activeList) => set({ activeList }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingActive: (isLoadingActive) => set({ isLoadingActive }),
  
  addList: (list) => set((state) => ({ 
    lists: [list, ...state.lists] 
  })),
  
  removeList: (id) => set((state) => ({ 
    lists: state.lists.filter((l) => l.id !== id),
    activeList: state.activeList?.id === id ? null : state.activeList,
  })),

  // Sincronizar checks de activeList a lists
  syncActiveToLists: () => set((state) => {
    if (!state.activeList) return state;

    // Extraer items actualizados de activeList
    const updatedItems: { id: string; checked: boolean }[] = [];
    state.activeList.stores.forEach((store) => {
      store.categories.forEach((cat) => {
        cat.products.forEach((prod) => {
          updatedItems.push({ id: prod.itemId, checked: prod.checked });
        });
      });
    });

    // Actualizar la lista correspondiente en lists
    const updatedLists = state.lists.map((list) => {
      if (list.id !== state.activeList?.id) return list;
      return {
        ...list,
        items: list.items.map((item) => {
          const updated = updatedItems.find((u) => u.id === item.id);
          return updated ? { ...item, checked: updated.checked } : item;
        }),
      };
    });

    return { lists: updatedLists };
  }),

  // Toggle item optimistically in active list
  toggleItemInActive: (itemId) => set((state) => {
    if (!state.activeList) return state;

    const updatedStores = state.activeList.stores.map((store) => ({
      ...store,
      categories: store.categories.map((cat) => ({
        ...cat,
        products: cat.products.map((prod) =>
          prod.itemId === itemId ? { ...prod, checked: !prod.checked } : prod
        ),
      })),
    }));

    return {
      activeList: { ...state.activeList, stores: updatedStores },
    };
  }),

  // Modal actions
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDeleteModal: (list) => set({ isDeleteModalOpen: true, deletingList: list }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deletingList: null }),
}));

// Selector: Progreso de la lista activa
export const useListProgress = () => {
  const activeList = useShoppingListStore((state) => state.activeList);
  
  if (!activeList) return { total: 0, checked: 0, percentage: 0 };

  let total = 0;
  let checked = 0;

  activeList.stores.forEach((store) => {
    store.categories.forEach((cat) => {
      cat.products.forEach((prod) => {
        total++;
        if (prod.checked) checked++;
      });
    });
  });

  return {
    total,
    checked,
    percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
  };
};