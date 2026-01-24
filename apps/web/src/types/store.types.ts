// src/types/store.types.tsx

import { 
  ShoppingCart, 
  ShoppingBag, 
  Store as StoreIcon, // Alias para no chocar con la interfaz Store
  Building2, 
  Home,
  LucideIcon 
} from 'lucide-react';

// --- INTERFACES DE MODELO ---

export interface Store {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreFormData {
  name: string;
  location?: string;
}

// --- INTERFACES DE API (Lo que el servicio necesita) ---

export interface CreateStoreRequest {
  name: string;
  location?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  location?: string;
}

export interface StoresResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// --- CONFIGURACIÓN DE UI & SUGERENCIAS ---

export interface StoreSuggestion {
  name: string;
  icon: LucideIcon;
  color: string;
}

export const storeSuggestions: StoreSuggestion[] = [
  { name: 'Éxito', icon: ShoppingCart, color: 'text-primary-600' },      
  { name: 'Olímpica', icon: ShoppingCart, color: 'text-primary-600' },    
  { name: 'Jumbo', icon: ShoppingBag, color: 'text-primary-600' },    
  { name: 'D1', icon: StoreIcon, color: 'text-primary-600' },             
  { name: 'Ara', icon: StoreIcon, color: 'text-primary-600' },          
  { name: 'Carulla', icon: ShoppingCart, color: 'text-primary-600' },   
  { name: 'Metro', icon: ShoppingBag, color: 'text-primary-600' },        
  { name: 'Surtimax', icon: StoreIcon, color: 'text-primary-600' },      
  { name: 'Mercado local', icon: Building2, color: 'text-primary-600' }, 
  { name: 'Tienda de barrio', icon: Home, color: 'text-primary-600' }, 
];

export const getStoreIcon = (name: string) => {
  const suggestion = storeSuggestions.find((s) =>
    name.toLowerCase().includes(s.name.toLowerCase())
  );
  
  // Si no hay match, usamos el icono de Tienda genérico
  return suggestion || { 
    icon: StoreIcon, 
    color: 'text-primary-600' 
  };
};