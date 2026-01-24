'use client';

import { Trophy, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { PriceComparisonBestOption } from '@/types/analytics.types';

interface BestPriceCardProps {
  // Extendemos el tipo localmente para incluir la tendencia y el último precio
  bestOption: PriceComparisonBestOption & {
    lastPrice?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

export function BestPriceCard({ bestOption }: BestPriceCardProps) {
  // Comprobamos si el precio actual es mayor al récord histórico
  const hasIncreasedFromRecord = bestOption.lastPrice && bestOption.lastPrice > bestOption.price;

  return (
    <div className="bg-success-50 border border-success-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-success-500 rounded-lg">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-success-800">Mejor opción histórica</h3>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-success-900 truncate">
            {bestOption.storeName}
          </p>

          <div className="mt-1 flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-success-600">
                {formatCurrency(bestOption.price)}
              </span>
              <span className="text-[10px] font-bold text-success-700/60 uppercase tracking-wider">
                Récord
              </span>
            </div>

            {/* Píldoras de tendencia usando los mismos colores de StoreComparisonList */}
            <div className="flex items-center gap-2">
              {hasIncreasedFromRecord ? (
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-danger-100 text-danger-700 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>Actual: {formatCurrency(bestOption.lastPrice!)}</span>
                </div>
              ) : bestOption.trend === 'down' ? (
                <div className="flex items-center gap-2 px-4 py-1  rounded-full bg-success-100 text-success-600 text-sm font-medium">
                  <TrendingDown className="h-4 w-4" />
                  <span>¡En su punto más bajo!</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Sección de ahorros vs promedio del mercado */}
        {bestOption.savings > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-1 text-success-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-2xl font-bold">
                -{bestOption.savingsPercentage}%
              </span>
            </div>
            <p className="text-[10px] font-medium text-success-700/80 uppercase">
              vs promedio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}