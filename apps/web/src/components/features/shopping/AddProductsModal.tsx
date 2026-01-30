'use client';

import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';

import { Modal, ModalFooter } from '@/components/ui/Modal'; // Usando tus componentes
import { Button } from '@/components/ui/Button';
import { productService } from '@/services/product.service';
import { getCategoryConfig } from '@/types/product.types';
import type { Product } from '@/types/product.types';

interface AddProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productIds: string[]) => void;
  isLoading: boolean;
  existingProductIds: string[];
}

export function AddProductsModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading,
  existingProductIds 
}: AddProductsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cargar productos
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await productService.getAllWithoutPagination();
        // Filtrar productos que ya están en la lista
        const available = res.products.filter(p => !existingProductIds.includes(p.id));
        setProducts(available);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [isOpen, existingProductIds]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [isOpen]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const cat = product.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedIds.size === 0) return;
    onSubmit(Array.from(selectedIds));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Agregar Productos"
      size="md"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {selectedIds.size > 0
            ? `${selectedIds.size} producto(s) seleccionado(s)`
            : `${products.length} productos disponibles para agregar`}
        </p>

        {/* Product List */}
        <div className="border border-border rounded-xl max-h-[400px] overflow-y-auto bg-card">
          {loadingProducts ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Cargando productos...
            </div>
          ) : Object.keys(groupedProducts).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {products.length === 0 
                ? 'Todos los productos ya están en la lista'
                : 'No se encontraron productos'}
            </div>
          ) : (
            Object.entries(groupedProducts).map(([category, prods]) => {
              const config = getCategoryConfig(category);
              return (
                <div key={category}>
                  <div className="sticky top-0 bg-muted/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    {config.label}
                  </div>
                  <div className="divide-y divide-border/50">
                    {prods.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-all ${
                          selectedIds.has(product.id) ? 'bg-primary-50/70' : ''
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selectedIds.has(product.id)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {selectedIds.has(product.id) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || isLoading}
          isLoading={isLoading}
        >
          Agregar ({selectedIds.size})
        </Button>
      </ModalFooter>
    </Modal>
  );
}