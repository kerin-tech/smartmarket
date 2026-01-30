'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { productService } from '@/services/product.service';
import { getCategoryConfig } from '@/types/product.types';
import type { Product } from '@/types/product.types';
import type { ProductMatch } from '@/types/ticket.types';

interface SearchProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (match: ProductMatch) => void;
}

export function SearchProductModal({
  isOpen,
  onClose,
  onSelectProduct,
}: SearchProductModalProps) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Usar el nuevo endpoint sin paginación
        const response = await productService.getAllWithoutPagination();
        setProducts(response.products);
        setFilteredProducts(response.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [isOpen]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = search.toLowerCase();
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (product: Product) => {
    const match: ProductMatch = {
      product_id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand || undefined,
      confidence: 1.0,
      match_level: 'high',
    };
    onSelectProduct(match);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Buscar producto"
      size="md"
    >
      <div className="space-y-4">
        <SearchInput
          placeholder="Buscar por nombre, marca o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          autoFocus
        />

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground mt-3">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {search ? 'No se encontraron productos' : 'No hay productos'}
            </p>
            <p className="text-xs text-muted-foreground">
              {search ? 'Intenta con otro término de búsqueda' : 'Aún no has creado productos'}
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-1 custom-scrollbar">
            {filteredProducts.map((product) => {
              const config = getCategoryConfig(product.category);
              const Icon = config.icon || ShoppingCart;
              
              return (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded">{config.label}</span>
                      {product.brand && (
                        <>
                          <span>•</span>
                          <span>{product.brand}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {search && filteredProducts.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
}