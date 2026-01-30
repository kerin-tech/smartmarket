'use client';

import { ArrowLeft, RotateCcw, Store, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { AddProductsModal } from './AddProductsModal';
import { shoppingListService } from '@/services/shoppingList.service';
import { useShoppingListStore, useListProgress } from '@/stores/shoppingList.store';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import type { OptimizedShoppingList, OptimizedProduct } from '@/types/shoppingList.types';

interface OptimizedListViewProps {
  list: OptimizedShoppingList;
  onBack: () => void;
  onReset: () => void;
}

export function OptimizedListView({ list, onBack, onReset }: OptimizedListViewProps) {
  const { toggleItemInActive, setActiveList } = useShoppingListStore();
  const { total, checked, percentage } = useListProgress();
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>(
    () => Object.fromEntries(list.stores.map((s) => [s.storeId, true]))
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingProducts, setIsAddingProducts] = useState(false);

  // Obtener IDs de productos existentes en la lista
  const existingProductIds = list.stores.flatMap((store) =>
    store.categories.flatMap((cat) => cat.products.map((p) => p.productId))
  );

  const toggleStore = (storeId: string) => {
    setExpandedStores((prev) => ({ ...prev, [storeId]: !prev[storeId] }));
  };

  const handleToggleItem = async (itemId: string) => {
    toggleItemInActive(itemId);
    try {
      await shoppingListService.toggleItem(itemId);
    } catch (err) {
      toggleItemInActive(itemId);
    }
  };

  const handleAddProducts = async (productIds: string[]) => {
    setIsAddingProducts(true);
    try {
      const updatedList = await shoppingListService.addProducts(list.id, productIds);
      setActiveList(updatedList);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingProducts(false);
    }
  };

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
<div className=" bg-muted pb-4 -mx-4 px-4 pt-2 space-y-3">
  
  {/* El botón de volver arriba a la izquierda como el referente */}
  <button 
    onClick={onBack}
    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    <ArrowLeft className="h-4 w-4" />
    <span>Volver a mis listas</span>
  </button>

  {/* Contenedor flex para alinear Títulos y Botones de acción */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{list.name}</h1>
      <p className="text-sm text-muted-foreground">
        Total estimado: <span className="font-semibold text-primary-600">{formatCurrency(list.grandTotal)}</span>
      </p>
    </div>

    {/* Acciones: Se apilan en móvil y se alinean a la derecha en desktop */}
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset} 
        leftIcon={<RotateCcw className="h-4 w-4" />}
        className="flex-1 sm:flex-none"
      >
        Reiniciar
      </Button>
      <Button 
        variant="primary" 
        size="sm" 
        onClick={() => setIsAddModalOpen(true)} 
        leftIcon={<Plus className="h-4 w-4" />}
        className="flex-1 sm:flex-none"
      >
        Agregar
      </Button>
    </div>
  </div>
 
</div>


  {/* Progress - Se mantiene el diseño visual intacto */}
 

<div className=" space-y-4 sticky top-20 z-20 bg-card rounded-xl border border-border p-3">
    <div className="flex justify-between text-sm mb-2">
      <span className="text-muted-foreground font-medium">Progreso de compra</span>
      <span className="font-semibold">{checked} de {total} ({percentage}%)</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>

      {/* Stores */}
      <div className="space-y-4">
        {list.stores.map((store) => (
          <div key={store.storeId} className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Store Header */}
            <button
              onClick={() => toggleStore(store.storeId)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-foreground">{store.storeName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {store.categories.reduce((acc, c) => acc + c.products.length, 0)} productos
                    {store.total > 0 && ` · ${formatCurrency(store.total)}`}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  expandedStores[store.storeId] ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Categories & Products */}
            {expandedStores[store.storeId] && (
              <div className="border-t border-border divide-y divide-border">
                {store.categories.map((category) => {
                  const config = getCategoryConfig(category.name);
                  const CategoryIcon = config.icon;

                  return (
                    <div key={category.name} className="p-3">
                      {/* Category Label */}
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {config.label}
                        </span>
                      </div>

                      {/* Products */}
                      <div className="space-y-1">
                        {category.products.map((product) => (
                          <ProductItem
                            key={product.itemId}
                            product={product}
                            onToggle={() => handleToggleItem(product.itemId)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal para agregar productos */}
      <AddProductsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProducts}
        isLoading={isAddingProducts}
        existingProductIds={existingProductIds}
      />
    </div>
  );
}

// Product Item Component
function ProductItem({ product, onToggle }: { product: OptimizedProduct; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
        product.checked
          ? 'bg-muted/50 opacity-60'
          : 'hover:bg-muted/30'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          product.checked
            ? 'bg-primary-500 border-primary-500'
            : 'border-muted-foreground/30'
        }`}
      >
        {product.checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 text-left min-w-0">
        <p className={`font-medium truncate ${product.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {product.productName}
        </p>
        {product.brand && (
          <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
        )}
      </div>

      {/* Price */}
      {product.bestPrice && (
        <span className={`text-sm font-semibold shrink-0 ${product.checked ? 'text-muted-foreground' : 'text-primary-600'}`}>
          {formatCurrency(product.bestPrice)}
        </span>
      )}
    </button>
  );
}