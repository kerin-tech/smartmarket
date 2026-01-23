'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
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
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [totalPaidWithDiscount, setTotalPaidWithDiscount] = useState<number>(0);

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

  // Recuperar valores en edición
  useEffect(() => {
    if (isOpen && editingItem && products.length > 0) {
      const product = products.find((p) => p.id === editingItem.productId);
      if (product) {
        setSelectedProduct(product);
        setQuantity(editingItem.quantity);
        setUnitPrice(editingItem.unitPrice); 
        
        if (editingItem.discountPercentage && editingItem.discountPercentage > 0) {
          setHasDiscount(true);
          setDiscountPercentage(editingItem.discountPercentage);
          const total = (editingItem.quantity * editingItem.unitPrice) * (1 - (editingItem.discountPercentage / 100));
          setTotalPaidWithDiscount(Number(total.toFixed(2)));
        } else {
          setHasDiscount(false);
          setDiscountPercentage(0);
          setTotalPaidWithDiscount(editingItem.quantity * editingItem.unitPrice);
        }
        setStep('details');
      }
    }
  }, [isOpen, editingItem, products]);

  // Filtro de búsqueda
  useEffect(() => {
    const query = search.toLowerCase();
    setFilteredProducts(
      products.filter((p) =>
        p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
      )
    );
  }, [search, products]);

  const totalListPrice = quantity * unitPrice;

  // Sincronización de totales
  useEffect(() => {
    if (!hasDiscount) {
      setTotalPaidWithDiscount(Number(totalListPrice.toFixed(2)));
      setDiscountPercentage(0);
    } else {
      const newTotal = totalListPrice * (1 - (discountPercentage / 100));
      setTotalPaidWithDiscount(Number(newTotal.toFixed(2)));
    }
  }, [hasDiscount, totalListPrice, quantity, unitPrice, discountPercentage]);

  const handleDiscountPercentChange = (percent: number) => {
    setDiscountPercentage(percent);
    const newTotal = totalListPrice * (1 - (percent / 100));
    setTotalPaidWithDiscount(Number(newTotal.toFixed(2)));
  };

  const handleTotalPaidChange = (finalTotal: number) => {
    setTotalPaidWithDiscount(finalTotal);
    if (totalListPrice > 0) {
      const percent = ((totalListPrice - finalTotal) / totalListPrice) * 100;
      setDiscountPercentage(Number(percent.toFixed(2)));
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const item: PurchaseItemFormData = {
      productId: selectedProduct.id,
      quantity,
      unitPrice: unitPrice, 
      discountPercentage: hasDiscount ? discountPercentage : 0,
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

  const handleClose = () => {
    setStep('select');
    setSelectedProduct(null);
    setQuantity(1);
    setUnitPrice(0);
    setHasDiscount(false);
    setDiscountPercentage(0);
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
          <SearchInput
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="py-8 flex justify-center"><Spinner size="md" /></div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-lg">
                    {getCategoryConfig(product.category).emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{product.name}</p>
                    <p className="text-xs text-secondary-500">{getCategoryConfig(product.category).label}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          </ModalFooter>
        </div>
      ) : (
        <div className="space-y-5">
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-secondary-200 flex items-center justify-center text-lg">
                {getCategoryConfig(selectedProduct.category).emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900 truncate">{selectedProduct.name}</p>
                <p className="text-xs text-secondary-500">{getCategoryConfig(selectedProduct.category).label}</p>
              </div>
              {!editingItem && (
                <Button variant="ghost" size="sm" onClick={handleBack}>Cambiar</Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad"
              type="number"
              step="0.001"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              autoFocus
            />
            <Input
              label="Precio unitario lista"
              type="number"
              step="0.01"
              value={unitPrice || ''}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="p-3 border border-secondary-200 rounded-lg space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-secondary-700">¿Tiene descuento?</span>
            </label>

            {hasDiscount && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-secondary-100">
                <Input
                  label="% Descuento"
                  type="number"
                  step="0.01"
                  value={discountPercentage || ''}
                  onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Total ítem (Factura)"
                  type="number"
                  step="0.01"
                  value={totalPaidWithDiscount || ''}
                  onChange={(e) => handleTotalPaidChange(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {/* CAJA DE TOTAL: Ahora consistente con PurchaseForm */}
          <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
            {hasDiscount && (
              <div className="flex justify-between items-center pb-2 border-b border-secondary-200/50">
                <span className="text-sm font-medium text-secondary-700">Ahorro en este producto</span>
                <span className="font-medium text-green-600">-{formatCurrency(totalListPrice - totalPaidWithDiscount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-1">
              <div className="flex flex-col">
                <span className="text-md font-medium text-secondary-700">Subtotal</span>
                {hasDiscount && (
                   <span className="text-[10px] text-secondary-500 line-through">
                    Base: {formatCurrency(totalListPrice)}
                   </span>
                )}
              </div>
              <span className="text-xl font-bold text-secondary-900">
                {formatCurrency(totalPaidWithDiscount)}
              </span>
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            {!editingItem && <Button variant="outline" onClick={handleBack}>Atrás</Button>}
            <Button onClick={handleAddItem} disabled={!isValid}>
              {editingItem ? 'Guardar Cambios' : 'Agregar a la Compra'}
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
}