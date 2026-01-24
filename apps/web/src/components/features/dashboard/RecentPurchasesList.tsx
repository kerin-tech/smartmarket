// src/components/features/dashboard/RecentPurchasesList.tsx

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateRelative } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import type { Purchase } from '@/types/purchase.types';

interface RecentPurchasesListProps {
  purchases: Purchase[];
}

export function RecentPurchasesList({ purchases }: RecentPurchasesListProps) {
  if (purchases.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-color p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Compras recientes
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay compras recientes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-color overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-color">
        <h3 className="text-base font-semibold text-foreground">
          Compras recientes
        </h3>
        <Link
          href="/purchases"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Lista */}
      <div className="divide-y divide-border">
        {purchases.slice(0, 5).map((purchase) => {
          // Obtener el primer item para mostrar
          const firstItem = purchase.items[0];
          const config = firstItem ? getCategoryConfig(firstItem.product.category) : null;
          const itemCount = purchase.items.length;

          // Calcular total
          const total = purchase.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
          );

          return (
            <Link
              key={purchase.id}
              href="/purchases"
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors"
            >
              {/* Emoji de categoría */}
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                {config?.emoji || '🛒'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {firstItem?.product.name || 'Compra'}
                  {itemCount > 1 && (
                    <span className="text-muted-foreground font-normal">
                      {' '}+{itemCount - 1} más
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {purchase.store.name} • {formatDateRelative(purchase.date)}
                </p>
              </div>

              {/* Total */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(total)}
                </p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}