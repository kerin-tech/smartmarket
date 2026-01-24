// src/components/features/compare/StoreComparisonList.tsx

'use client';

import { MapPin, Trophy } from 'lucide-react';
import { formatCurrency, formatDateRelative } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { PriceComparisonStore } from '@/types/analytics.types';

interface StoreComparisonListProps {
  stores: PriceComparisonStore[];
  bestStoreId?: string;
}

export function StoreComparisonList({ stores, bestStoreId }: StoreComparisonListProps) {
  if (stores.length === 0) {
    return null;
  }

  // El primer store es el de menor precio (ya viene ordenado del backend)
  const lowestPrice = stores[0]?.avgPrice || 0;

  return (
    <div className="bg-card rounded-xl border border-color p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Comparativa por local
      </h3>

      <div className="space-y-3">
        {stores.map((item, index) => {
          const isBest = item.store.id === bestStoreId || index === 0;
          const priceDiff = lowestPrice > 0 
            ? Math.round(((item.avgPrice - lowestPrice) / lowestPrice) * 100)
            : 0;

          return (
            <div
              key={item.store.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                isBest ? 'bg-success-50 border border-success-200' : 'bg-muted'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                  isBest ? 'bg-success-500 text-white' : 'bg-secondary-200 text-muted-foreground'
                )}
              >
                {isBest ? (
                  <Trophy className="h-5 w-5" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    'text-sm font-semibold truncate',
                    isBest ? 'text-success-900' : 'text-foreground'
                  )}>
                    {item.store.name}
                  </h4>
                  {isBest && (
                    <span className="text-xs font-medium text-success-600 bg-success-100 px-1.5 py-0.5 rounded">
                      Mejor
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateRelative(item.lastDate)} · {item.purchaseCount} {item.purchaseCount === 1 ? 'compra' : 'compras'}
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className={cn(
                  'text-base font-bold',
                  isBest ? 'text-success-700' : 'text-foreground'
                )}>
                  {formatCurrency(item.lastPrice)}
                </p>
                {!isBest && priceDiff > 0 && (
                  <p className="text-xs text-danger-600 font-medium">
                    +{priceDiff}%
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}