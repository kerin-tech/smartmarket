'use client';

import { ShoppingCart, Store, Calendar, Package, Plus, Link, TrendingDown } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';

interface ConfirmPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    store: string;
    date: string;
    itemCount: number;
    newProductsCount: number;
    matchedProductsCount: number;
    total: number;
    savings: number;
    discountedItemsCount: number;
  };
  isLoading?: boolean;
}

export function ConfirmPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  isLoading
}: ConfirmPurchaseModalProps) {
  const formatDateDisplay = (isoDate: string) => {
    try {
      return new Date(isoDate + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar compra"
      size="md"
    >
      <div className="space-y-6">
        {/* Resumen visual */}
        <div className="text-center pb-4 border-b border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            ¿Confirmar esta compra?
          </h3>
          <p className="text-sm text-muted-foreground">
            Revisa el resumen antes de guardar
          </p>
        </div>

        {/* Detalles de la compra */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="font-medium text-foreground truncate">{data.store}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-medium text-foreground capitalize">{formatDateDisplay(data.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Productos</p>
              <p className="font-medium text-foreground">{data.itemCount} productos</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.matchedProductsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-full flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    {data.matchedProductsCount} vinculados
                  </span>
                )}
                {data.newProductsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-full flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    {data.newProductsCount} nuevos
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total y ahorros */}
        <div className="bg-muted rounded-xl p-4 space-y-3">
          {data.savings > 0 && (
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">Ahorro total</p>
                  <p className="text-xs text-muted-foreground">
                    {data.discountedItemsCount} {data.discountedItemsCount === 1 ? 'producto' : 'productos'} con descuento
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                -{formatCurrency(data.savings)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-foreground">Total de la compra</span>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(data.total)}
            </span>
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 Esta compra se agregará a tu historial y podrás compararla con futuras compras.
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Revisar de nuevo
        </Button>
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
        >
          Sí, guardar compra
        </Button>
      </ModalFooter>
    </Modal>
  );
}