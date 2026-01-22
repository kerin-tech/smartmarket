// src/components/features/purchases/AddItemModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { productService } from '@/services/product.service';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import type { Product } from '@/types/product.types';
import type { PurchaseItemFormData } from '@/types/purchase.types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: PurchaseItemFormData) => void;
  editingItem?: PurchaseItemFormData | null;
}

export function AddItemModal({ isOpen, onClose, onAddItem, editingItem }: AddItemModalProps) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Selected product and form data
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  // Load products
  useEffect(() => {
    if (!isOpen) return;
    
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAll({ limit: 100 });
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

  // Filter products on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
    } else {
      const query = search.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query)
        )
      );
    }
  }, [search, products]);

  // Initialize for edit mode
  useEffect(() => {
    if (editingItem && isOpen) {
      const product = products.find((p) => p.id === editingItem.productId);
      if (product) {
        setSelectedProduct(product);
        setQuantity(editingItem.quantity);
        setUnitPrice(editingItem.unitPrice);
        setStep('details');
      }
    }
  }, [editingItem, products, isOpen]);

  const handleClose = () => {
    setStep('select');
    setSelectedProduct(null);
    setQuantity(1);
    setUnitPrice(0);
    setSearch('');
    onClose();
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStep('details');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedProduct(null);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const item: PurchaseItemFormData = {
      productId: selectedProduct.id,
      quantity,
      unitPrice,
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        brand: selectedProduct.brand || '',
      },
      tempId: editingItem?.tempId || `temp-${Date.now()}`,
    };

    onAddItem(item);
    handleClose();
  };

  const subtotal = quantity * unitPrice;
  const isValid = selectedProduct && quantity > 0 && unitPrice > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'select' ? 'Agregar producto' : (editingItem ? 'Editar producto' : 'Cantidad y precio')}
      size="md"
    >
      {step === 'select' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Product list */}
          <div className="max-h-80 overflow-y-auto -mx-6 px-6">
            {loading ? (
              <div className="py-8 text-center text-secondary-500">
                Cargando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-secondary-500">
                {search ? 'No se encontraron productos' : 'No hay productos'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const config = getCategoryConfig(product.category);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-lg">
                        {config.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {product.category}
                          {product.brand && ` · ${product.brand}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create new product link */}
          <div className="border-t pt-4 -mx-6 px-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear nuevo producto
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Selected product info */}
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-secondary-200 flex items-center justify-center text-lg">
                {getCategoryConfig(selectedProduct.category).emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900 truncate">
                  {selectedProduct.name}
                </p>
                <p className="text-xs text-secondary-500">
                  {selectedProduct.category}
                </p>
              </div>
              {!editingItem && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Cambiar
                </button>
              )}
            </div>
          )}

          {/* Quantity and price */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad"
              type="number"
              step="0.001"
              min="0"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="1"
            />
            <Input
              label="Precio unitario"
              type="number"
              step="1"
              min="0"
              value={unitPrice || ''}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          {/* Subtotal */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Subtotal</span>
              <span className="text-lg font-bold text-secondary-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            {!editingItem && (
              <Button variant="outline" onClick={handleBack}>
                Atrás
              </Button>
            )}
            <Button onClick={handleAddItem} disabled={!isValid}>
              {editingItem ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}