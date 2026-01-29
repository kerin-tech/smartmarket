'use client';

import { CheckCircle2, Store, Calendar, Package, Plus, Link, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface PurchaseSuccessSummaryProps {
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
  onViewPurchases?: () => void;
  onNewPurchase?: () => void;
  className?: string;
}

export function PurchaseSuccessSummary({
  data,
  onViewPurchases,
  onNewPurchase,
  className
}: PurchaseSuccessSummaryProps) {
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

  const savingsPercentage = data.total > 0 && data.savings > 0
    ? Math.round((data.savings / (data.total + data.savings)) * 100)
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero section - Success */}
      <div className="text-center pb-6 border-b border-border">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ¡Compra registrada con éxito!
        </h2>
        <p className="text-muted-foreground">
          Tu compra ha sido guardada y está lista para analizar
        </p>
      </div>

      {/* Información clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="font-semibold text-foreground truncate">{data.store}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-semibold text-foreground capitalize text-sm">
                {formatDateDisplay(data.date)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-muted rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Total de productos</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{data.itemCount}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.matchedProductsCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-950/30 rounded-lg flex-1 min-w-0">
              <Link className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 dark:text-green-400">Vinculados</p>
                <p className="font-bold text-green-800 dark:text-green-300">{data.matchedProductsCount}</p>
              </div>
            </div>
          )}
          {data.newProductsCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex-1 min-w-0">
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-700 dark:text-blue-400">Nuevos</p>
                <p className="font-bold text-blue-800 dark:text-blue-300">{data.newProductsCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-5 space-y-4 border border-primary/20">
        {data.savings > 0 && (
          <div className="flex items-center justify-between pb-4 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">¡Ahorraste!</p>
                <p className="text-xs text-muted-foreground">
                  {data.discountedItemsCount} {data.discountedItemsCount === 1 ? 'producto' : 'productos'} con descuento
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                -{formatCurrency(data.savings)}
              </p>
              {savingsPercentage > 0 && (
                <p className="text-xs font-semibold text-green-700 dark:text-green-500">
                  {savingsPercentage}% de descuento
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Total pagado</span>
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(data.total)}
          </span>
        </div>
      </div>

      {/* Insight box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              ¿Sabías que...?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Ahora puedes comparar los precios de estos productos con futuras compras y descubrir dónde comprar más barato.
            </p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {onNewPurchase && (
          <Button
            variant="secondary"
            onClick={onNewPurchase}
            className="sm:flex-1"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Registrar otra compra
          </Button>
        )}
        {onViewPurchases && (
          <Button
            onClick={onViewPurchases}
            className="sm:flex-1"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Ver mis compras
          </Button>
        )}
      </div>
    </div>
  );
}