'use client';

import { useEffect, useState } from 'react';
import { Plus, Package } from 'lucide-react';

import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PurchaseItemRow } from './PurchaseItemRow';
import { AddItemModal } from './AddItemModal';

import { storeService } from '@/services/store.service';
import { formatCurrency } from '@/utils/formatters';
import type { Store } from '@/types/store.types';
import type { Purchase, PurchaseItemFormData, CreatePurchaseRequest } from '@/types/purchase.types';

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePurchaseRequest) => Promise<void>;
  purchase?: Purchase | null;
  isLoading?: boolean;
}

export function PurchaseForm({
  isOpen,
  onClose,
  onSubmit,
  purchase,
  isLoading = false,
}: PurchaseFormProps) {
  const isEditing = !!purchase;
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  
  const [storeId, setStoreId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseItemFormData[]>([]);
  
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PurchaseItemFormData | null>(null);

  // Cargar tiendas
  useEffect(() => {
    if (!isOpen) return;
    const loadStores = async () => {
      setLoadingStores(true);
      try {
        const response = await storeService.getAll({ limit: 100 });
        setStores(response.stores);
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, [isOpen]);

  // Cargar datos cuando se edita
  useEffect(() => {
    if (purchase && isOpen) {
      setStoreId(purchase.store.id);
      setDate(purchase.date.split('T')[0]);
      setItems(purchase.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage, 
        product: item.product,
        tempId: item.id,
      })));
    } else if (isOpen) {
      setStoreId('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([]);
    }
  }, [purchase, isOpen]);

  // Lógica de cálculo de totales y ahorros
  const summary = items.reduce((acc, item) => {
    const base = item.quantity * item.unitPrice;
    const discount = base * ((item.discountPercentage || 0) / 100);
    
    return {
      totalBase: acc.totalBase + base,
      totalFinal: acc.totalFinal + (base - discount),
      totalSavings: acc.totalSavings + discount,
      discountedItemsCount: (item.discountPercentage || 0) > 0 
        ? acc.discountedItemsCount + 1 
        : acc.discountedItemsCount
    };
  }, { totalBase: 0, totalFinal: 0, totalSavings: 0, discountedItemsCount: 0 });

  // Porcentaje de ahorro efectivo total
  const effectiveSavingsPercentage = summary.totalBase > 0 
    ? Math.round((summary.totalSavings / summary.totalBase) * 100) 
    : 0;

  const handleClose = () => {
    setStoreId('');
    setDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    onClose();
  };

  const handleAddItem = (item: PurchaseItemFormData) => {
    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.tempId === editingItem.tempId ? item : i)));
    } else {
      setItems((prev) => [...prev, item]);
    }
    setEditingItem(null);
  };

  const handleEditItem = (item: PurchaseItemFormData) => {
    setEditingItem(item);
    setIsAddItemOpen(true);
  };

  const handleDeleteItem = (tempId: string) => {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if (!storeId || !date || items.length === 0) return;
    const data: CreatePurchaseRequest = {
      storeId,
      date,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage || 0,
      })),
    };
    await onSubmit(data);
  };

  const isValid = storeId && date && items.length > 0;

  const storeOptions = stores.map((s) => ({ 
    value: s.id, 
    label: s.name 
  }));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditing ? 'Editar Compra' : 'Nueva Compra'}
        size="lg"
      >
        <div className="space-y-6">
          {loadingStores ? (
            <div className="py-8 text-center text-secondary-500">Cargando...</div>
          ) : (
            <>
              {/* Selector de Local y Fecha */}
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
  <div className="w-full">
    <Select
      label="Local"
      placeholder="Seleccionar local"
      options={storeOptions}
      value={storeId}
      onChange={(e) => setStoreId(e.target.value)}
      disabled={isLoading}
    />
  </div>
  <div className="w-full">
    <Input
  label="Fecha"
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  disabled={isLoading}
  max={new Date().toISOString().split('T')[0]}
  className="w-full min-w-0 appearance-none [&::-webkit-date-and-time-value]:text-left"
  style={{ 
    WebkitAppearance: 'none',
    maxWidth: '100%',
    boxSizing: 'border-box'
  }}
/>
  </div>
</div>

              <hr className="border-secondary-200" />

              {/* Lista de Productos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-secondary-700">
                    Productos ({items.length})
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingItem(null); setIsAddItemOpen(true); }}
                    leftIcon={<Plus className="h-4 w-4" />}
                    disabled={isLoading}
                  >
                    Agregar
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-secondary-200 rounded-xl">
                    <Package className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500 mb-3">Agrega productos a tu compra</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingItem(null); setIsAddItemOpen(true); }}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Agregar producto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <PurchaseItemRow
                        key={item.tempId}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Caja de Total con Ahorro Efectivo */}
              <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
                {summary.totalSavings > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-secondary-200/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-secondary-700">
                        Ahorro ({summary.discountedItemsCount} {summary.discountedItemsCount === 1 ? 'prod.' : 'prods.'})
                      </span>
                      <span className="text-[10px] text-secondary-500 uppercase tracking-wider font-semibold">
                        Ahorro efectivo
                      </span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-sm font-bold text-green-600">
                        -{formatCurrency(summary.totalSavings)}
                      </span>
                      <span className="text-[10px] font-bold text-green-600/80">
                        {effectiveSavingsPercentage}% dto. total
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-1">
                  <span className="text-md font-medium text-secondary-700">Total a pagar</span>
                  <span className="text-xl font-bold text-secondary-900">
                    {formatCurrency(summary.totalFinal)}
                  </span>
                </div>
              </div>

              <ModalFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={!isValid}
                >
                  {isEditing ? 'Guardar cambios' : 'Guardar compra'}
                </Button>
              </ModalFooter>
            </>
          )}
        </div>
      </Modal>

      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => { setIsAddItemOpen(false); setEditingItem(null); }}
        onAddItem={handleAddItem}
        editingItem={editingItem}
      />
    </>
  );
}