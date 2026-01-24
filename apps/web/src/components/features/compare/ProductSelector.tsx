// src/components/features/compare/ProductSelector.tsx

'use client';

import { useState, useEffect } from 'react';
import { Search, X, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryConfig } from '@/types/product.types';
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

  useEffect(() => {
    if (!searchQuery.trim()) return;

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

  // VISTA: Producto Seleccionado (Chip)
  if (selectedProduct) {
    const config = getCategoryConfig(selectedProduct.category);
    const Icon = config.icon || ShoppingCart;

    return (
      <div className="relative">
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-foreground truncate block">
              {selectedProduct.name}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
            aria-label="Quitar producto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // VISTA: Buscador
  return (
    <div className="relative">
      <div className="relative z-50">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar producto para comparar..."
          className="w-full pl-11 pr-11 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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

      {showResults && (
        <>
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">
                Buscando productos...
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No se encontraron resultados' : 'Empieza a escribir...'}
              </div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {searchQuery ? 'Resultados de búsqueda' : 'Sugeridos'}
                </div>
                {products.map((product) => {
                  const config = getCategoryConfig(product.category);
                  const Icon = config.icon || ShoppingCart;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0  transition-colors">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary-700">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {config.label} {product.brand && `· ${product.brand}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Overlay invisible para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowResults(false)}
          />
        </>
      )}
    </div>
  );
}