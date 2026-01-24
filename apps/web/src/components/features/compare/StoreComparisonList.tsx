// src/components/features/compare/StoreComparisonList.tsx

'use client';

import { MapPin, Trophy, TrendingDown, TrendingUp } from 'lucide-react';
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

  // Encontramos el precio mínimo absoluto entre todas las tiendas para calcular diferencias reales
  const absoluteMinPrice = Math.min(...stores.map(s => Number(s.minPrice || s.lastPrice)));

  return (
    <div className="bg-card rounded-xl border border-color p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Comparativa por local
      </h3>

      <div className="space-y-3">
        {stores.map((item) => {
          // Lógica robusta: Es el mejor si el ID coincide O si su minPrice es igual al mínimo absoluto
          const isBest = item.store.id === bestStoreId || Number(item.minPrice) === absoluteMinPrice;

          const priceDiff = absoluteMinPrice > 0
            ? Math.round(((item.lastPrice - absoluteMinPrice) / absoluteMinPrice) * 100)
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
                  isBest ? 'bg-success-500 text-white' : 'bg-primary-100 text-primary-600'
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

              {/* Price Details */}
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 mt-0.5 animate-in fade-in duration-300">
                  {/* Píldora de Bajada */}
                  {item.trend === 'down' && item.previousPrice != null && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success-100 text-success-600 text-xs font-medium">
                      <TrendingDown className="h-3 w-3" />
                      <span>-{formatCurrency(Number(item.previousPrice) - Number(item.lastPrice))}</span>
                    </div>
                  )}

                  {/* Píldora de Subida */}
                  {item.trend === 'up' && item.previousPrice != null && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-danger-100 text-danger-700 text-xs font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{formatCurrency(Number(item.lastPrice) - Number(item.previousPrice))}</span>
                    </div>
                  )}
                  {/* Precio principal */}
                  <p className={cn(
                    'text-base font-bold leading-none',
                    isBest ? 'text-success-700' : 'text-foreground'
                  )}>
                    {formatCurrency(item.lastPrice)}
                  </p>
                </div>


                {/* Solo mostramos la línea de tendencia/referencia si hay más de una compra */}
                {item.purchaseCount > 1 && (
                  <div className="flex items-center gap-1.5 mt-0.5 animate-in fade-in duration-300">


                    {/* Referencia Dinámica: Solo si el precio actual es distinto al récord/máximo */}
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                      {item.trend === 'down' ? (
                        item.lastPrice < item.maxPrice && (
                          <>Max: <span className="text-danger-600">{formatCurrency(item.maxPrice)}</span></>
                        )
                      ) : (
                        item.lastPrice > item.minPrice && (
                          <>Min: <span className="text-success-600 font-semibold">{formatCurrency(item.minPrice)}</span></>
                        )
                      )}
                    </span>
                  </div>
                )}

                {/* Diferencia vs líder (Esta sí se muestra siempre que no sea el líder, para comparar tiendas) */}
                {!isBest && priceDiff > 0 && (
                  <p className="text-[10px] font-semibold text-danger-600">
                    +{priceDiff}% vs líder
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