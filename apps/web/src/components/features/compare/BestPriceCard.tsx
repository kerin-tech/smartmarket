// src/components/features/compare/BestPriceCard.tsx

'use client';

import { Trophy, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { PriceComparisonBestOption } from '@/types/analytics.types';

interface BestPriceCardProps {
  bestOption: PriceComparisonBestOption;
}

export function BestPriceCard({ bestOption }: BestPriceCardProps) {
  return (
    <div className="bg-gradient-to-br from-success-50 to-success-100 border border-success-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-success-500 rounded-lg">
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-success-800">Mejor precio</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-success-900">{bestOption.storeName}</p>
          <p className="text-2xl font-bold text-success-700 mt-1">
            {formatCurrency(bestOption.lastPrice)}
          </p>
        </div>

        {bestOption.savings > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-success-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Ahorras {bestOption.savingsPercentage}%
              </span>
            </div>
            <p className="text-sm text-success-700 mt-0.5">
              {formatCurrency(bestOption.savings)} menos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}