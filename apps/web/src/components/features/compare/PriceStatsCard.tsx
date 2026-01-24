'use client';

import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { PriceComparisonGlobalStats } from '@/types/analytics.types';

interface PriceStatsCardProps {
  // Cambiamos a opcional para que no rompa el renderizado si el API falla o cambia
  stats?: PriceComparisonGlobalStats; 
}

export function PriceStatsCard({ stats }: PriceStatsCardProps) {
  // Si no hay estadísticas, mostramos un estado vacío elegante en lugar de un error
  if (!stats) {
    return (
      <div className="bg-card rounded-xl border border-color p-5 text-center">
        <p className="text-sm text-muted-foreground">No hay estadísticas globales disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-color p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Estadísticas de precio
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Mínimo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-success-100 mb-2">
            <TrendingDown className="h-5 w-5 text-success-600" />
          </div>
          <p className="text-lg font-bold text-success-600">
            {formatCurrency(stats.minPrice || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Mínimo</p>
        </div>

        {/* Promedio */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 mb-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(stats.avgPrice || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Promedio</p>
        </div>

        {/* Máximo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-danger-100 mb-2">
            <TrendingUp className="h-5 w-5 text-danger-600" />
          </div>
          <p className="text-lg font-bold text-danger-600">
            {formatCurrency(stats.maxPrice || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Máximo</p>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-color text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{stats.totalPurchases || 0}</strong>{' '}
          {stats.totalPurchases === 1 ? 'compra' : 'compras'}
        </span>
        <span>
          <strong className="text-foreground">{stats.storesCount || 0}</strong>{' '}
          {stats.storesCount === 1 ? 'local' : 'locales'}
        </span>
      </div>
    </div>
  );
}