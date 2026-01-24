'use client';

import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { PriceComparisonGlobalStats } from '@/types/analytics.types';
import { ShoppingCart, Package } from 'lucide-react';

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

      <div className="grid mb-8 grid-cols-3 gap-4">
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


      {/* Estadísticas Sutiles */}
<div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border">
  <span className="text-xs text-muted-foreground">Métricas basadas en:</span>
  
  {/* Badge de Compras */}
  <div className="flex items-center gap-1.5">
    <span className="text-xs font-medium text-primary-700 bg-primary-100 px-3 py-1 rounded-full">
      {stats.totalPurchases || 0} {stats.totalPurchases === 1 ? 'compra' : 'compras'}
    </span>
  </div>

  {/* Badge de Locales */}
  <div className="flex items-center gap-1.5">
    <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
      {stats.storesCount || 0} {stats.storesCount === 1 ? 'local' : 'locales'}
    </span>
  </div>
</div>


    </div>
  );
}