// src/components/features/compare/ProductSelector.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryConfig } from '@/types/product.types';
import { formatCurrency } from '@/utils/formatters';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product.types';

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
  onClear: () => void;
}

export function ProductSelector({
  selectedProduct,
  onSelect,
  onClear,
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Cargar productos recientes al inicio
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getAll({ limit: 10 });
        setProducts(response.products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  // Buscar productos con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await productService.getAll({ search: searchQuery, limit: 20 });
        setProducts(response.products);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onClear();
    setSearchQuery('');
  };

  // Si hay producto seleccionado, mostrar chip
  if (selectedProduct) {
    const config = getCategoryConfig(selectedProduct.category);
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 bg-card border border-color rounded-xl">
          <Search className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{config.emoji}</span>
            <span className="font-medium text-foreground">{selectedProduct.name}</span>
          </div>
          <button
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar producto..."
          className="w-full pl-11 pr-4 py-3 bg-card border border-color rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showResults && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-color rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Buscando...
            </div>
          ) : products.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-color">
                {searchQuery ? 'Resultados' : 'Productos recientes'}
              </div>
              {products.map((product) => {
                const config = getCategoryConfig(product.category);
                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {config.label} · {product.brand}
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}