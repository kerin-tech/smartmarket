// src/components/features/purchases/PurchaseForm.tsx

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

  useEffect(() => {
    if (purchase && isOpen) {
      setStoreId(purchase.store.id);
      setDate(purchase.date.split('T')[0]);
      setItems(purchase.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product,
        tempId: item.id,
      })));
    } else if (isOpen) {
      setStoreId('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([]);
    }
  }, [purchase, isOpen]);

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
      })),
    };
    await onSubmit(data);
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const isValid = storeId && date && items.length > 0;
  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Editar Compra' : 'Nueva Compra'} size="lg">
        <div className="space-y-6">
          {loadingStores ? (
            <div className="py-8 text-center text-secondary-500">Cargando...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Local *" placeholder="Seleccionar local" options={storeOptions} value={storeId} onChange={setStoreId} disabled={isLoading} />
                <Input label="Fecha *" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isLoading} max={new Date().toISOString().split('T')[0]} />
              </div>

              <hr className="border-secondary-200" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-secondary-700">Productos ({items.length})</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingItem(null); setIsAddItemOpen(true); }} leftIcon={<Plus className="h-4 w-4" />} disabled={isLoading}>
                    Agregar
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-secondary-200 rounded-xl">
                    <Package className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500 mb-3">Agrega productos a tu compra</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => { setEditingItem(null); setIsAddItemOpen(true); }} leftIcon={<Plus className="h-4 w-4" />}>
                      Agregar producto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <PurchaseItemRow key={item.tempId} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-secondary-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Total</span>
                  <span className="text-xl font-bold text-secondary-900">{formatCurrency(total)}</span>
                </div>
              </div>

              <ModalFooter>
                <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
                <Button type="button" onClick={handleSubmit} isLoading={isLoading} disabled={!isValid || isLoading}>
                  {isEditing ? 'Guardar cambios' : 'Guardar compra'}
                </Button>
              </ModalFooter>
            </>
          )}
        </div>
      </Modal>

      <AddItemModal isOpen={isAddItemOpen} onClose={() => { setIsAddItemOpen(false); setEditingItem(null); }} onAddItem={handleAddItem} editingItem={editingItem} />
    </>
  );
}