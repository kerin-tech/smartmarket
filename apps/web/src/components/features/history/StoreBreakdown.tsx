// src/components/features/history/StoreBreakdown.tsx

'use client';

import { MapPin } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { StoreBreakdown as StoreBreakdownType } from '@/types/analytics.types';

interface StoreBreakdownProps {
  stores: StoreBreakdownType[];
  totalSpent: number;
  isLoading?: boolean;
}

export function StoreBreakdown({ stores, totalSpent, isLoading }: StoreBreakdownProps) {
  if (isLoading) {
    return <StoreBreakdownSkeleton />;
  }

  if (stores.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-color p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Gastos por local
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay datos de locales para este mes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-color p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Gastos por local
      </h3>

      <div className="space-y-4">
        {stores.map((store) => {
          const percentage = totalSpent > 0 
            ? Math.round((store.totalSpent / totalSpent) * 100)
            : 0;

          return (
            <div
              key={store.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {store.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {store.totalPurchases} {store.totalPurchases === 1 ? 'compra' : 'compras'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(store.totalSpent)}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoreBreakdownSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-color p-6">
      <div className="h-5 w-32 bg-secondary-200 rounded animate-pulse mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <div className="w-10 h-10 bg-secondary-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="w-28 h-4 bg-secondary-200 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-secondary-200 rounded animate-pulse" />
                </div>
                <div className="text-right space-y-1">
                  <div className="w-24 h-4 bg-secondary-200 rounded animate-pulse" />
                  <div className="w-10 h-3 bg-secondary-200 rounded animate-pulse ml-auto" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}