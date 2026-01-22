// src/services/product.service.ts

import api from './api';
import type { 
  Product, 
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
} from '@/types/product.types';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ApiProductResponse {
  product: {
    id: string;
    name: string;
    category: string;
    brand: string;
    createdAt: string;
  };
}

interface ApiProductsResponse {
  products: Array<{
    id: string;
    name: string;
    category: string;
    brand: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Mapear respuesta del backend al tipo del frontend
const mapProduct = (backendProduct: ApiProductResponse['product']): Product => ({
  id: backendProduct.id,
  name: backendProduct.name,
  category: backendProduct.category,
  brand: backendProduct.brand,
  createdAt: backendProduct.createdAt,
});

export const productService = {
  /**
   * Obtener todos los productos con paginación y filtros
   */
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    category?: string;
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    const url = query ? `/products?${query}` : '/products';

    const response = await api.get<ApiSuccessResponse<ApiProductsResponse>>(url);

    return {
      products: response.data.data.products.map(mapProduct),
      pagination: response.data.data.pagination,
    };
  },

  /**
   * Obtener producto por ID
   */
  async getById(id: string): Promise<Product> {
    const response = await api.get<ApiSuccessResponse<ApiProductResponse>>(
      `/products/${id}`
    );
    return mapProduct(response.data.data.product);
  },

  /**
   * Crear nuevo producto
   */
  async create(data: CreateProductRequest): Promise<Product> {
    const response = await api.post<ApiSuccessResponse<ApiProductResponse>>(
      '/products',
      {
        name: data.name,
        category: data.category,
        brand: data.brand || '',
      }
    );
    return mapProduct(response.data.data.product);
  },

  /**
   * Actualizar producto
   */
  async update(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await api.put<ApiSuccessResponse<ApiProductResponse>>(
      `/products/${id}`,
      data
    );
    return mapProduct(response.data.data.product);
  },

  /**
   * Eliminar producto
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};