'use client';

import { useState, useEffect, useMemo } from 'react';
import { Check, ShoppingCart, Calendar, Package, History, Trash2, ShoppingBag, Sparkles } from 'lucide-react';

import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { SearchInput } from '@/components/ui/SearchInput';
import { Input } from '@/components/ui/Input';
// Importamos el ConfirmModal
import { ConfirmModal } from '@/components/ui/ConfirmModal'; 
import { purchaseService } from '@/services/purchase.service';
import { productService } from '@/services/product.service';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import { FREQUENCY_OPTIONS, type CreateShoppingListRequest } from '@/types/shoppingList.types';
import type { Purchase } from '@/types/purchase.types';
import type { Product } from '@/types/product.types';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShoppingListRequest) => void;
  isLoading: boolean;
  initialProductIds?: string[];
  initialPurchaseId?: string; // <--- AGREGAR ESTA LÍNEA
}

type SelectionMode = 'purchases' | 'products';

export function CreateListModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  initialProductIds,
  initialPurchaseId 
}: CreateListModalProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [mode, setMode] = useState<SelectionMode>('purchases');
  
  // Estado para el modal de confirmación de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [selectedPurchaseIds, setSelectedPurchaseIds] = useState<Set<string>>(new Set());
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchProducts, setSearchProducts] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    const loadData = async () => {
      setLoadingPurchases(true);
      setLoadingProducts(true);
      try {
        const [purchasesRes, productsRes] = await Promise.all([
          purchaseService.getAll({ limit: 50 }),
          productService.getAllWithoutPagination()
        ]);
        setPurchases(purchasesRes.purchases);
        setProducts(productsRes.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPurchases(false);
        setLoadingProducts(false);
      }
    };
    loadData();
  }, [isOpen]);

 useEffect(() => {
  if (isOpen && products.length > 0) {
    // Caso 1: Si viene una compra del historial (Nueva lógica)
    if (initialPurchaseId && purchases.length > 0) {
      const purchase = purchases.find(p => p.id === initialPurchaseId);
      if (purchase) {
        setSelectedPurchaseIds(new Set([initialPurchaseId]));
        const pIds = purchase.items?.map(i => i.productId).filter(Boolean) || [];
        setSelectedProductIds(new Set(pIds as string[]));
        setName(`Lista de ${purchase.store?.name || 'Mi Compra'}`);
      }
    } 
    // Caso 2: Si vienen productos sueltos (Lógica anterior)
    else if (initialProductIds && initialProductIds.length > 0) {
      setSelectedProductIds(new Set(initialProductIds));
    }
  }
}, [isOpen, initialPurchaseId, initialProductIds, products, purchases]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setFrequency('');
      setMode('purchases');
      setSelectedPurchaseIds(new Set());
      setSelectedProductIds(new Set());
      setSearchProducts('');
      setShowCancelModal(false); // Aseguramos que el modal de confirmar esté cerrado
    }
  }, [isOpen]);

  const togglePurchase = (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    setSelectedPurchaseIds((prev) => {
      const next = new Set(prev);
      const wasSelected = next.has(purchaseId);
      
      if (wasSelected) {
        next.delete(purchaseId);
      } else {
        next.add(purchaseId);
      }

      setSelectedProductIds((prevProducts) => {
        const nextProducts = new Set(prevProducts);
        purchase.items?.forEach((item) => {
          if (wasSelected) {
            const inOtherPurchase = purchases.some(
              p => p.id !== purchaseId && next.has(p.id) && p.items?.some(i => i.productId === item.productId)
            );
            if (!inOtherPurchase) {
              nextProducts.delete(item.productId);
            }
          } else {
            nextProducts.add(item.productId);
          }
        });
        return nextProducts;
      });

      return next;
    });
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const clearAllProducts = () => {
    setSelectedProductIds(new Set());
    setSelectedPurchaseIds(new Set());
  };

  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.has(p.id));
  }, [products, selectedProductIds]);

  const groupedSelectedProducts = useMemo(() => {
    return selectedProducts.reduce((acc, product) => {
      const cat = product.category || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [selectedProducts]);

  const handleSubmit = () => {
    if (!name.trim() || selectedProductIds.size === 0) return;
    onSubmit({
      name: name.trim(),
      frequency: (frequency || null) as CreateShoppingListRequest['frequency'],
      productIds: Array.from(selectedProductIds),
    });
  };

  // Lógica inteligente para cancelar
  const handleCancelClick = () => {
    // Si hay datos ingresados (nombre o productos), pedimos confirmación
    if (name.trim().length > 0 || selectedProductIds.size > 0) {
      setShowCancelModal(true);
    } else {
      // Si está vacío, cerramos directamente
      onClose();
    }
  };

  const handleFinalCancel = () => {
    setShowCancelModal(false);
    onClose();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProducts.toLowerCase())
  );

  const groupedFilteredProducts = filteredProducts.reduce((acc, product) => {
    const cat = product.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCancelClick} title="Nueva Lista de Compras" size="full">
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full lg:max-w-5xl lg:mx-auto lg:max-h-[70vh]">
          
          {/* Left: Selection Panel */}
          <div className="flex-none lg:flex-1 flex flex-col space-y-5 lg:w-1/2 min-h-0">
            
            <div className="space-y-3">
              <Input
                label="Nombre de la lista"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mercado semanal, Asado del domingo..."
              />
              <div>
                <label className="block text-sm font-medium mb-1.5">¿Cada cuánto repites esta compra?</label>
                <FilterSelect
                  options={FREQUENCY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  value={frequency}
                  onChange={setFrequency}
                />
              </div>
            </div>

            <div className="flex-none lg:flex-1 flex flex-col min-h-0">
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-2">Selecciona productos desde:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('purchases')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      mode === 'purchases'
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    <span>Mis compras</span>
                    {purchases.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        mode === 'purchases' ? 'bg-primary-200 text-primary-800' : 'bg-muted text-muted-foreground'
                      }`}>
                        {purchases.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setMode('products')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      mode === 'products'
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    <span>Catálogo</span>
                    {products.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        mode === 'products' ? 'bg-primary-200 text-primary-800' : 'bg-muted text-muted-foreground'
                      }`}>
                        {products.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {mode === 'purchases' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecciona una o varias compras para importar todos sus productos
                  </p>
                  <div className="h-[500px] lg:h-auto lg:flex-1 border border-border rounded-xl overflow-y-auto bg-card">
                    {loadingPurchases ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <div className="animate-pulse">Cargando compras...</div>
                      </div>
                    ) : purchases.length === 0 ? (
                      <div className="p-8 text-center">
                        <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Aún no tienes compras registradas</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {purchases.map((purchase) => {
                          const isSelected = selectedPurchaseIds.has(purchase.id);
                          const itemCount = purchase.items?.length || 0;
                          const total = purchase.items?.reduce(
                            (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0
                          ) || 0;

                          return (
                            <button
                              key={purchase.id}
                              onClick={() => togglePurchase(purchase.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-all ${
                                isSelected ? 'bg-primary-50/70' : ''
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-primary-500 border-primary-500' : 'border-muted-foreground/30'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                                <ShoppingCart className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-semibold truncate">{purchase.store?.name || 'Tienda'}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(purchase.date)}</span>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                  <span>{itemCount} productos</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-primary-600">{formatCurrency(total)}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'products' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="mb-2">
                    <SearchInput
                      placeholder="Buscar por nombre o categoría..."
                      value={searchProducts}
                      onChange={(e) => setSearchProducts(e.target.value)}
                      onClear={() => setSearchProducts('')}
                    />
                  </div>
                  <div className="h-[500px] lg:h-auto lg:flex-1 border border-border rounded-xl overflow-y-auto bg-card">
                    {loadingProducts ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <div className="animate-pulse">Cargando productos...</div>
                      </div>
                    ) : Object.keys(groupedFilteredProducts).length === 0 ? (
                      <div className="p-8 text-center">
                        <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">No se encontraron productos</p>
                      </div>
                    ) : (
                      Object.entries(groupedFilteredProducts).map(([category, prods]) => {
                        const config = getCategoryConfig(category);
                        const CategoryIcon = config.icon;
                        return (
                          <div key={category}>
                            <div className="sticky top-0 flex items-center gap-2 px-4 py-2 bg-muted/80 backdrop-blur-sm border-b border-border">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{config.label}</span>
                              <span className="text-xs text-muted-foreground">({prods.length})</span>
                            </div>
                            <div className="divide-y divide-border/50">
                              {prods.map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() => toggleProduct(product.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-all ${
                                    selectedProductIds.has(product.id) ? 'bg-primary-50/70' : ''
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                    selectedProductIds.has(product.id)
                                      ? 'bg-primary-500 border-primary-500'
                                      : 'border-muted-foreground/30'
                                  }`}>
                                    {selectedProductIds.has(product.id) && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">{product.name}</p>
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
              )}
            </div>
          </div>

          {/* Right: Preview Panel */}
          <div className="min-h-[500px] max-h-[500px] lg:min-h-0 lg:max-h-none lg:flex-1 flex flex-col border-2 border-dashed border-border rounded-2xl bg-muted/20 lg:w-1/2 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Tu lista</p>
                  <p className="text-xs text-muted-foreground">{selectedProductIds.size} productos</p>
                </div>
              </div>
              {selectedProductIds.size > 0 && (
                <button
                  onClick={clearAllProducts}
                  className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Vaciar lista
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedProductIds.size === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-1">Tu lista está vacía</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Selecciona compras anteriores o productos del catálogo para comenzar
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {Object.entries(groupedSelectedProducts).map(([category, prods]) => {
                    const config = getCategoryConfig(category);
                    const CategoryIcon = config.icon;
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50">
                          <CategoryIcon className="h-4 w-4 text-primary-600" />
                          <span className="text-xs font-bold text-foreground uppercase tracking-wide">{config.label}</span>
                          <span className="ml-auto text-xs font-medium text-muted-foreground">{prods.length}</span>
                        </div>
                        <div>
                          {prods.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 group transition-colors"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                {product.brand && (
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeProduct(product.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <ModalFooter>
          {/* Usamos handleCancelClick en lugar de onClose directo */}
          <Button variant="outline" onClick={handleCancelClick}>Cancelar</Button>
          <Button
  onClick={handleSubmit}
  disabled={!name.trim() || selectedProductIds.size === 0 || isLoading}
  isLoading={isLoading}
>
  Crear Lista ({selectedProductIds.size})
</Button>
        </ModalFooter>
      </Modal>

      {/* Modal de confirmación para cancelar */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleFinalCancel}
        title="¿Descartar lista?"
        message="Si cancelas ahora, perderás la lista que estás creando. Esta acción no se puede deshacer."
        confirmText="Sí, descartar"
        cancelText="Seguir editando"
        variant="danger"
      />
    </>
  );
}