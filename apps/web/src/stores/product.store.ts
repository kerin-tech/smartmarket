// src/stores/product.store.ts

import { create } from 'zustand';
import type { Product } from '@/types/product.types';

interface ProductState {
  // Data
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  searchQuery: string;
  selectedCategory: string;
  
  // Modal state
  isModalOpen: boolean;
  editingProduct: Product | null;
  
  // Delete confirmation
  isDeleteModalOpen: boolean;
  deletingProduct: Product | null;
  
  // Context menu
  menuOpenForId: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  
  // Modal actions
  openCreateModal: () => void;
  openEditModal: (product: Product) => void;
  closeModal: () => void;
  
  // Delete modal actions
  openDeleteModal: (product: Product) => void;
  closeDeleteModal: () => void;
  
  // Context menu actions
  openMenu: (productId: string) => void;
  closeMenu: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'all',
  isModalOpen: false,
  editingProduct: null,
  isDeleteModalOpen: false,
  deletingProduct: null,
  menuOpenForId: null,

  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (product) => set((state) => ({
    products: state.products.map((p) => (p.id === product.id ? product : p)),
  })),
  removeProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  openCreateModal: () => set({ isModalOpen: true, editingProduct: null, menuOpenForId: null }),
  openEditModal: (product) => set({ isModalOpen: true, editingProduct: product, menuOpenForId: null }),
  closeModal: () => set({ isModalOpen: false, editingProduct: null }),

  openDeleteModal: (product) => set({ isDeleteModalOpen: true, deletingProduct: product, menuOpenForId: null }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deletingProduct: null }),
  
  openMenu: (productId) => set({ menuOpenForId: productId }),
  closeMenu: () => set({ menuOpenForId: null }),
}));

// Selector para productos filtrados
export const useFilteredProducts = () => {
  const products = useProductStore((state) => state.products);
  const searchQuery = useProductStore((state) => state.searchQuery);
  const selectedCategory = useProductStore((state) => state.selectedCategory);

  return products.filter((product) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};

// Selector para contar productos por categoría
export const useCategoryCounts = () => {
  const products = useProductStore((state) => state.products);
  
  const counts: Record<string, number> = { all: products.length };
  
  products.forEach((product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
  });
  
  return counts;
};

// Selector para productos agrupados por categoría
export const useGroupedProducts = () => {
  const filteredProducts = useFilteredProducts();
  
  const grouped = new Map<string, Product[]>();
  
  filteredProducts.forEach((product) => {
    if (!grouped.has(product.category)) {
      grouped.set(product.category, []);
    }
    grouped.get(product.category)!.push(product);
  });
  
  return grouped;
};