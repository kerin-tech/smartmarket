'use client';

import { useState, useEffect } from 'react';
import { Store as StoreIcon, Calendar, Package, Check, AlertCircle, ChevronDown, ChevronUp, Sparkles, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
// Importamos el ConfirmModal
import { ConfirmModal } from '@/components/ui/ConfirmModal'; 
import { TicketItemRow } from './TicketItemRow';
import { ConfirmPurchaseModal } from './ConfirmPurchaseModal';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

import type { TicketReviewState, EditableItem, ProductMatch, StoreMatch } from '@/types/ticket.types';
import type { Store } from '@/types/store.types';

interface TicketReviewProps {
  data: TicketReviewState;
  imagePreview?: string | null;
  userStores?: Store[];
  onUpdateItem: (tempId: string, updates: Partial<EditableItem>) => void;
  onSelectMatch: (tempId: string, match: ProductMatch | null) => void;
  onSelectStore: (store: StoreMatch | null) => void;
  onSelectExistingStore: (storeId: string) => void;
  onUpdateDate: (date: string) => void;
  onDeleteItem: (tempId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TicketReview({
  data,
  imagePreview,
  userStores = [],
  onUpdateItem,
  onSelectMatch,
  onSelectStore,
  onSelectExistingStore,
  onUpdateDate,
  onDeleteItem,
  onConfirm,
  onCancel,
  isLoading,
}: TicketReviewProps) {
  const [showImage, setShowImage] = useState(false);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  
  // Estado para el modal de confirmación de compra
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // NUEVO: Estado para el modal de confirmación de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [dateValue, setDateValue] = useState(
    data.detected_date ? data.detected_date.split('T')[0] : new Date().toISOString().split('T')[0]
  );

  const activeItems = data.items.filter(i => !i.isDeleted);
  
  const matchedCount = activeItems.filter(i => i.selected_match !== null).length;
  const newCount = activeItems.filter(i => i.selected_match === null).length;
  const pendingCount = activeItems.filter(i => 
    i.match?.match_level === 'medium' && i.selected_match === null
  ).length;
  
  const estimatedTotal = activeItems.reduce(
    (sum, item) => sum + (item.detected_price * item.detected_quantity), 0
  );

  // Calcular ahorros totales
  const totalSavings = activeItems.reduce((sum, item) => {
    if (item.has_discount && item.original_price && item.original_price > item.detected_price) {
      return sum + ((item.original_price - item.detected_price) * item.detected_quantity);
    }
    return sum;
  }, 0);

  const discountedItemsCount = activeItems.filter(i => i.has_discount && (i.discount_percentage || 0) > 0).length;

  useEffect(() => {
    if (data.detected_date) {
      setDateValue(data.detected_date.split('T')[0]);
    }
  }, [data.detected_date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    onUpdateDate(newDate);
  };

  const formatDateDisplay = (isoDate: string) => {
    try {
      return new Date(isoDate + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const hasStoreMatch = data.store_matches && data.store_matches.length > 0;

  const storeOptions = userStores.map(store => ({
    value: store.id,
    label: store.location ? `${store.name} - ${store.location}` : store.name
  }));

  const handleConfirmClick = () => {
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    onConfirm();
  };

  // NUEVO: Manejador para el botón de cancelar
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // NUEVO: Confirmación final de cancelación
  const handleFinalCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header con info del ticket */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          {/* Tienda */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <StoreIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {data.selected_store?.name || data.detected_store}
                </p>
                {data.selected_store ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Tienda existente
                  </span>
                ) : (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Se creará nueva tienda
                  </span>
                )}
              </div>
            </div>

            {!hasStoreMatch && (
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      No se encontró coincidencia para: <strong>"{data.detected_store}"</strong>
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Selecciona una tienda existente o se creará una nueva
                    </p>
                  </div>
                </div>

                {userStores.length > 0 && (
                  <Select
                    label="Seleccionar tienda existente"
                    value={data.selected_store?.store_id || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        onSelectExistingStore(e.target.value);
                      } else {
                        onSelectStore(null);
                      }
                    }}
                    options={[
                      { value: '', label: '-- Crear nueva tienda --' },
                      ...storeOptions
                    ]}
                  />
                )}
              </div>
            )}

            {hasStoreMatch && (
              <>
                <button
                  onClick={() => setShowStoreSelector(!showStoreSelector)}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Cambiar tienda
                </button>

                {showStoreSelector && (
                  <div className="bg-muted/50 rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Coincidencias encontradas
                    </p>
                    
                    <div className="space-y-1">
                      {data.store_matches.map((store) => (
                        <button
                          key={store.store_id}
                          onClick={() => {
                            onSelectStore(store);
                            setShowStoreSelector(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                            data.selected_store?.store_id === store.store_id
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <div>
                            <p className="font-medium text-sm">{store.name}</p>
                            <p className="text-xs text-muted-foreground">{store.location}</p>
                          </div>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            store.confidence >= 0.7 ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                            store.confidence >= 0.4 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" :
                            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            {Math.round(store.confidence * 100)}%
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onSelectStore(null);
                        setShowStoreSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                        data.selected_store === null
                          ? "bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400"
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Crear "{data.detected_store}" como nueva tienda
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Fecha de compra</span>
            </div>
            <Input
              type="date"
              value={dateValue}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full min-w-0 appearance-none [&::-webkit-date-and-time-value]:text-left"
              style={{ 
                WebkitAppearance: 'none',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            />

            
            <p className="text-xs text-muted-foreground">
              {formatDateDisplay(dateValue)}
            </p>
          </div>

          {/* Toggle imagen */}
          {imagePreview && (
            <button
              onClick={() => setShowImage(!showImage)}
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              {showImage ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showImage ? 'Ocultar ticket' : 'Ver ticket original'}
            </button>
          )}

          {showImage && imagePreview && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Ticket" className="w-full max-h-64 object-contain bg-muted" />
            </div>
          )}
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{activeItems.length} productos</span>
          </div>
          
          {matchedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-full text-sm">
              <Check className="h-4 w-4" />
              <span className="font-medium">{matchedCount} vinculados</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 rounded-full text-sm">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">{pendingCount} con sugerencias</span>
            </div>
          )}
          
          {newCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-full text-sm">
              <Plus className="h-4 w-4" />
              <span className="font-medium">{newCount} nuevos</span>
            </div>
          )}
        </div>

        {/* Lista de productos */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {data.items.map((item) => (
            <TicketItemRow
              key={item.tempId}
              item={item}
              onUpdate={(updates) => onUpdateItem(item.tempId, updates)}
              onSelectMatch={(match) => onSelectMatch(item.tempId, match)}
              onDelete={() => onDeleteItem(item.tempId)}
            />
          ))}
        </div>

        {/* Totales */}
        <div className="bg-muted rounded-xl p-4 space-y-3">
          {totalSavings > 0 && (
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Ahorro ({discountedItemsCount} {discountedItemsCount === 1 ? 'prod.' : 'prods.'})
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Ahorro efectivo
                </span>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                -{formatCurrency(totalSavings)}
              </span>
            </div>
          )}

          {data.summary?.detected_total && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total detectado en ticket</span>
              <span className="font-medium text-muted-foreground">{formatCurrency(data.summary.detected_total)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-foreground">Total calculado</span>
            <span className={cn(
              "text-2xl font-bold",
              data.summary?.detected_total && Math.abs(estimatedTotal - data.summary.detected_total) > 100
                ? "text-amber-600 dark:text-amber-500"
                : "text-foreground"
            )}>
              {formatCurrency(estimatedTotal)}
            </span>
          </div>

          {data.summary?.detected_total && Math.abs(estimatedTotal - data.summary.detected_total) > 100 && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-600 dark:text-amber-500">
                Los totales no coinciden. Revisa los productos.
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleCancelClick} // Cambiado de onCancel directo a handleCancelClick
            disabled={isLoading}
            className="sm:flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmClick}
            disabled={activeItems.length === 0 || isLoading}
            className="sm:flex-1"
          >
            Confirmar compra ({activeItems.length})
          </Button>
        </div>
      </div>

      {/* Modal para confirmar compra */}
      <ConfirmPurchaseModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalConfirm}
        data={{
          store: data.selected_store?.name || data.detected_store,
          date: dateValue,
          itemCount: activeItems.length,
          newProductsCount: newCount,
          matchedProductsCount: matchedCount,
          total: estimatedTotal,
          savings: totalSavings,
          discountedItemsCount: discountedItemsCount,
        }}
        isLoading={isLoading}
      />

      {/* NUEVO: Modal para confirmar cancelación */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleFinalCancel}
        title="¿Descartar ticket?"
        message="Si cancelas ahora, perderás todos los datos detectados y las correcciones realizadas en este ticket. Esta acción no se puede deshacer."
        confirmText="Sí, descartar"
        cancelText="Continuar revisando"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}