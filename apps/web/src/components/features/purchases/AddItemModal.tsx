// src/components/features/purchases/AddItemModal.tsx

'use client';

import { useState, useEffect } from 'react';

import { Modal, ModalFooter } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import { productService } from '@/services/product.service';
import { formatCurrency } from '@/utils/formatters';
import { categoryConfig, getCategoryConfig } from '@/types/product.types';
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
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  // Cargar productos
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

  // Filtrar productos
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
    } else {
      const query = search.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        )
      );
    }
  }, [search, products]);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingItem && isOpen && products.length > 0) {
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
    setQuantity(1);
    setUnitPrice(0);
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
          <SearchInput
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            autoFocus
          />

          {/* Products list */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-secondary-500">
                {search ? 'No se encontraron productos' : 'No hay productos'}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const config = getCategoryConfig(product.category);

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-lg">
                      {config.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">{product.name}</p>
                      <p className="text-xs text-secondary-500">
                        {config.label}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Selected product */}
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-secondary-200 flex items-center justify-center text-lg">
                {getCategoryConfig(selectedProduct.category).emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900 truncate">{selectedProduct.name}</p>
                <p className="text-xs text-secondary-500">
                  {getCategoryConfig(selectedProduct.category).label}
                </p>
              </div>
              {!editingItem && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  Cambiar
                </Button>
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
              autoFocus
            />
            <Input
              label="Precio unitario"
              type="number"
              step="1"
              min="0"
              value={unitPrice || ''}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
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
              {editingItem ? 'Guardar' : 'Agregar'}
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}