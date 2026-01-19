// src/types/product.types.ts

export type CategoryKey = 
  | 'fruits' 
  | 'vegetables' 
  | 'meats' 
  | 'dairy' 
  | 'grains' 
  | 'beverages' 
  | 'cleaning' 
  | 'other';

export interface Product {
  id: string;
  name: string;
  category: CategoryKey;
  brand?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormData {
  name: string;
  category: CategoryKey;
  brand?: string;
}

export interface CreateProductRequest {
  name: string;
  category: CategoryKey;
  brand?: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
