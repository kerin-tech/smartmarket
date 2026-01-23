// src/components/features/compare/PriceStatsCard.tsx

'use client';

import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { PriceComparisonGlobalStats } from '@/types/analytics.types';

interface PriceStatsCardProps {
  stats: PriceComparisonGlobalStats;
}

export function PriceStatsCard({ stats }: PriceStatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-5">
      <h3 className="text-base font-semibold text-secondary-900 mb-4">
        Estadísticas de precio
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Mínimo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-success-100 mb-2">
            <TrendingDown className="h-5 w-5 text-success-600" />
          </div>
          <p className="text-lg font-bold text-success-600">
            {formatCurrency(stats.minPrice)}
          </p>
          <p className="text-xs text-secondary-500">Mínimo</p>
        </div>

        {/* Promedio */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 mb-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(stats.avgPrice)}
          </p>
          <p className="text-xs text-secondary-500">Promedio</p>
        </div>

        {/* Máximo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-danger-100 mb-2">
            <TrendingUp className="h-5 w-5 text-danger-600" />
          </div>
          <p className="text-lg font-bold text-danger-600">
            {formatCurrency(stats.maxPrice)}
          </p>
          <p className="text-xs text-secondary-500">Máximo</p>
        </div>
      </div>

      {/* Resumen adicional */}
      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-secondary-100 text-sm text-secondary-600">
        <span>
          <strong className="text-secondary-900">{stats.totalPurchases}</strong>{' '}
          {stats.totalPurchases === 1 ? 'compra' : 'compras'}
        </span>
        <span>
          <strong className="text-secondary-900">{stats.storesCount}</strong>{' '}
          {stats.storesCount === 1 ? 'local' : 'locales'}
        </span>
      </div>
    </div>
  );
}