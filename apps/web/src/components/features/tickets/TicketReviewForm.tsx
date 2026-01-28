// src/components/features/tickets/TicketReviewForm.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TicketItemRow } from './TicketItemRow';
import { TicketImagePreview } from './TicketImagePreview';
import { confirmTicket } from '@/services/ticket.service';
import { storeService } from '@/services/store.service';
import type { TicketScan, TicketScanItem } from '@/types/ticket.types';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface Store {
  id: string;
  name: string;
}

interface EditedItem {
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  status: 'MATCHED' | 'NEW' | 'IGNORED' | 'PENDING';
  matchedProductId: string | null;
}

interface TicketReviewFormProps {
  ticket: TicketScan;
}

export function TicketReviewForm({ ticket }: TicketReviewFormProps) {
  const router = useRouter();
  
  // Estado del formulario
  const [storeId, setStoreId] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    ticket.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [editedItems, setEditedItems] = useState<Record<string, EditedItem>>({});
  const [stores, setStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tiendas
  useEffect(() => {
    async function loadStores() {
      try {
        const response = await storeService.getAll();
        setStores(response.stores || []);
      } catch (err) {
        console.error('Error cargando tiendas:', err);
      }
    }
    loadStores();
  }, []);

  // Combinar items originales con ediciones
  const items = useMemo(() => {
    return ticket.items.map((item) => ({
      ...item,
      ...editedItems[item.id],
    }));
  }, [ticket.items, editedItems]);

  // Calcular totales
  const { activeItems, totalAmount, newProductsCount } = useMemo(() => {
    const active = items.filter((item) => {
      const edited = editedItems[item.id];
      const status = edited?.status || item.status;
      return status !== 'IGNORED';
    });

    const total = active.reduce((sum, item) => {
      const edited = editedItems[item.id];
      const price = edited?.detectedPrice ?? item.detectedPrice ?? 0;
      const qty = edited?.detectedQuantity ?? item.detectedQuantity ?? 1;
      return sum + price * qty;
    }, 0);

    const newCount = active.filter((item) => {
      const edited = editedItems[item.id];
      const status = edited?.status || item.status;
      return status === 'NEW';
    }).length;

    return { activeItems: active, totalAmount: total, newProductsCount: newCount };
  }, [items, editedItems]);

  // Handlers
  const handleItemChange = (itemId: string, changes: Partial<EditedItem>) => {
    setEditedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        detectedName: prev[itemId]?.detectedName || ticket.items.find(i => i.id === itemId)?.detectedName || '',
        detectedPrice: prev[itemId]?.detectedPrice ?? ticket.items.find(i => i.id === itemId)?.detectedPrice ?? null,
        detectedQuantity: prev[itemId]?.detectedQuantity ?? ticket.items.find(i => i.id === itemId)?.detectedQuantity ?? 1,
        status: prev[itemId]?.status || ticket.items.find(i => i.id === itemId)?.status || 'NEW',
        matchedProductId: prev[itemId]?.matchedProductId ?? ticket.items.find(i => i.id === itemId)?.matchedProduct?.id ?? null,
        ...changes,
      },
    }));
  };

  const handleIgnoreItem = (itemId: string) => {
    handleItemChange(itemId, { status: 'IGNORED' });
  };

  const handleRestoreItem = (itemId: string) => {
    const original = ticket.items.find((i) => i.id === itemId);
    const originalStatus = original?.status;
    const validStatus = originalStatus === 'MATCHED' || originalStatus === 'NEW' || originalStatus === 'PENDING' 
      ? originalStatus 
      : 'NEW';
    handleItemChange(itemId, { status: validStatus });
  };

  const handleSubmit = async () => {
    if (!storeId) {
      setError('Selecciona una tienda');
      return;
    }

    if (activeItems.length === 0) {
      setError('Debes tener al menos un producto');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await confirmTicket(ticket.id, {
        storeId,
        purchaseDate,
        items: activeItems.map((item) => ({
          id: item.id,
          detectedName: editedItems[item.id]?.detectedName || item.detectedName,
          detectedPrice: editedItems[item.id]?.detectedPrice ?? item.detectedPrice,
          detectedQuantity: editedItems[item.id]?.detectedQuantity ?? item.detectedQuantity,
          matchedProductId: editedItems[item.id]?.matchedProductId || item.matchedProduct?.id || null,
          status: editedItems[item.id]?.status || item.status,
        })),
      });

      router.push('/purchases?success=ticket_confirmed');
    } catch (err) {
      setError('Error al confirmar el ticket. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna izquierda: Imagen del ticket */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <TicketImagePreview imageUrl={ticket.imageUrl} />
          
          {/* Info de la tienda detectada */}
          {ticket.storeName && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Tienda detectada:</span> {ticket.storeName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Columna derecha: Formulario y lista de items */}
      <div className="lg:col-span-2">
        {/* Selectores de tienda y fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tienda *
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar tienda...</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de compra *
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de items */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Productos ({activeItems.length})
            </h2>
            <span className="text-sm text-gray-500">
              {newProductsCount} nuevos
            </span>
          </div>

          {items.map((item) => {
            const isIgnored = (editedItems[item.id]?.status || item.status) === 'IGNORED';
            
            return (
              <TicketItemRow
                key={item.id}
                item={item}
                isIgnored={isIgnored}
                onChange={(changes) => handleItemChange(item.id, changes)}
                onIgnore={() => handleIgnoreItem(item.id)}
                onRestore={() => handleRestoreItem(item.id)}
              />
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Footer con totales y botones */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Total estimado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalAmount.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{activeItems.length} productos</p>
              {newProductsCount > 0 && (
                <p className="text-xs text-blue-600">{newProductsCount} se crearán como nuevos</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !storeId}
              className={cn(
                'flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg transition-colors',
                isSubmitting || !storeId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              )}
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}