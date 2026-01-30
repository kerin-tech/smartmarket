// src/services/shoppingList.service.ts

import api from '@/services/api';
import type {
  ShoppingList,
  OptimizedShoppingList,
  CreateShoppingListRequest,
  ShoppingListItem,
} from '@/types/shoppingList.types';

const BASE_URL = '/shopping-lists';

export const shoppingListService = {
  // Obtener todas las listas
  async getAll(): Promise<ShoppingList[]> {
    const { data } = await api.get<ShoppingList[]>(BASE_URL);
    return data;
  },

  // Crear nueva lista
  async create(payload: CreateShoppingListRequest): Promise<ShoppingList> {
    const { data } = await api.post<ShoppingList>(BASE_URL, payload);
    return data;
  },

  // Obtener lista optimizada (agrupada por tienda/categoría)
  async getOptimized(listId: string): Promise<OptimizedShoppingList> {
    const { data } = await api.get<OptimizedShoppingList>(`${BASE_URL}/${listId}/optimized`);
    return data;
  },

  // Toggle check de un item
  async toggleItem(itemId: string): Promise<ShoppingListItem> {
    const { data } = await api.patch<ShoppingListItem>(`${BASE_URL}/items/${itemId}/toggle`);
    return data;
  },

  // Duplicar lista
  async duplicate(listId: string, name?: string): Promise<ShoppingList> {
    const { data } = await api.post<ShoppingList>(`${BASE_URL}/${listId}/duplicate`, { name });
    return data;
  },

  // Resetear checks
  async resetChecks(listId: string): Promise<OptimizedShoppingList> {
    const { data } = await api.post<OptimizedShoppingList>(`${BASE_URL}/${listId}/reset`);
    return data;
  },

  // Eliminar lista
  async delete(listId: string): Promise<void> {
    await api.delete(`${BASE_URL}/${listId}`);
  },

  // Agregar productos a lista existente
  async addProducts(listId: string, productIds: string[]): Promise<OptimizedShoppingList> {
    const { data } = await api.post<OptimizedShoppingList>(`${BASE_URL}/${listId}/products`, { productIds });
    return data;
  },
};