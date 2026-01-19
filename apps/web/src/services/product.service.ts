// src/services/product.service.ts

import type { 
  Product, 
  CreateProductRequest, 
  ProductsResponse,
} from '@/types/product.types';

// ============================================
// MOCK DATA - Remover cuando el backend esté listo
// ============================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockProducts: Product[] = [
  { id: '1', name: 'Manzana Roja', category: 'fruits', unit: 'kg', createdAt: '2025-01-10T10:00:00Z' },
  { id: '2', name: 'Banano', category: 'fruits', unit: 'kg', createdAt: '2025-01-10T10:00:00Z' },
  { id: '3', name: 'Naranja Valencia', category: 'fruits', unit: 'kg', createdAt: '2025-01-10T10:00:00Z' },
  { id: '4', name: 'Fresa', category: 'fruits', unit: 'gr', createdAt: '2025-01-10T10:00:00Z' },
  { id: '5', name: 'Papaya', category: 'fruits', unit: 'unidad', createdAt: '2025-01-10T10:00:00Z' },
  { id: '6', name: 'Zanahoria', category: 'vegetables', unit: 'kg', createdAt: '2025-01-11T10:00:00Z' },
  { id: '7', name: 'Tomate', category: 'vegetables', unit: 'kg', createdAt: '2025-01-11T10:00:00Z' },
  { id: '8', name: 'Cebolla Cabezona', category: 'vegetables', unit: 'kg', createdAt: '2025-01-11T10:00:00Z' },
  { id: '9', name: 'Papa Pastusa', category: 'vegetables', unit: 'kg', createdAt: '2025-01-11T10:00:00Z' },
  { id: '10', name: 'Leche Entera Colanta 1L', category: 'dairy', unit: 'unidad', createdAt: '2025-01-12T10:00:00Z' },
  { id: '11', name: 'Queso Campesino', category: 'dairy', unit: 'gr', createdAt: '2025-01-12T10:00:00Z' },
  { id: '12', name: 'Yogurt Alpina', category: 'dairy', unit: 'unidad', createdAt: '2025-01-12T10:00:00Z' },
  { id: '13', name: 'Arroz Diana 1kg', category: 'grains', unit: 'unidad', createdAt: '2025-01-13T10:00:00Z' },
  { id: '14', name: 'Arroz Diana 5kg', category: 'grains', unit: 'unidad', createdAt: '2025-01-13T10:00:00Z' },
  { id: '15', name: 'Arroz Integral 500g', category: 'grains', unit: 'unidad', createdAt: '2025-01-13T10:00:00Z' },
  { id: '16', name: 'Lentejas', category: 'grains', unit: 'kg', createdAt: '2025-01-13T10:00:00Z' },
  { id: '17', name: 'Frijol Rojo', category: 'grains', unit: 'kg', createdAt: '2025-01-13T10:00:00Z' },
  { id: '18', name: 'Avena Quaker', category: 'grains', unit: 'unidad', createdAt: '2025-01-13T10:00:00Z' },
  { id: '19', name: 'Pasta Doria', category: 'grains', unit: 'unidad', createdAt: '2025-01-13T10:00:00Z' },
  { id: '20', name: 'Harina de Trigo', category: 'grains', unit: 'kg', createdAt: '2025-01-13T10:00:00Z' },
  { id: '21', name: 'Pechuga de Pollo', category: 'meats', unit: 'kg', createdAt: '2025-01-14T10:00:00Z' },
  { id: '22', name: 'Carne Molida', category: 'meats', unit: 'kg', createdAt: '2025-01-14T10:00:00Z' },
  { id: '23', name: 'Coca-Cola 2.5L', category: 'beverages', unit: 'unidad', createdAt: '2025-01-15T10:00:00Z' },
  { id: '24', name: 'Detergente Líquido Fab', category: 'cleaning', unit: 'unidad', createdAt: '2025-01-16T10:00:00Z' },
];

let nextId = 25;

export const productService = {
  async getAll(): Promise<ProductsResponse> {
    await delay(800);
    return {
      products: [...mockProducts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      total: mockProducts.length,
    };
  },

  async getById(id: string): Promise<Product | null> {
    await delay(500);
    return mockProducts.find(p => p.id === id) || null;
  },

  async create(data: CreateProductRequest): Promise<Product> {
    await delay(1000);
    
    if (mockProducts.some(p => p.name.toLowerCase() === data.name.toLowerCase())) {
      throw { message: 'Ya existe un producto con este nombre', statusCode: 409 };
    }

    const newProduct: Product = {
      id: String(nextId++),
      name: data.name,
      category: data.category,
      unit: data.unit,
      createdAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);
    return newProduct;
  },

  async update(id: string, data: CreateProductRequest): Promise<Product> {
    await delay(1000);
    
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw { message: 'Producto no encontrado', statusCode: 404 };
    }

    if (mockProducts.some(p => p.id !== id && p.name.toLowerCase() === data.name.toLowerCase())) {
      throw { message: 'Ya existe un producto con este nombre', statusCode: 409 };
    }

    const updatedProduct: Product = {
      ...mockProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockProducts[index] = updatedProduct;
    return updatedProduct;
  },

  async delete(id: string): Promise<void> {
    await delay(800);
    
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw { message: 'Producto no encontrado', statusCode: 404 };
    }

    mockProducts.splice(index, 1);
  },
};
