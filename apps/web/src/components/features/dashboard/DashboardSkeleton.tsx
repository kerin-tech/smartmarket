// src/components/features/dashboard/DashboardSkeleton.tsx

'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: Saludo + Spending Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saludo Skeleton */}
        <div className="flex flex-col justify-center gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Spending Card Skeleton - AHORA SEMÁNTICO */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <Skeleton className="h-4 w-24 mb-2 opacity-50" />
          <Skeleton className="h-4 w-20 mb-3 opacity-30" />
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            // Cambiado border-color por border-border
            className="bg-card rounded-xl border border-border p-4"
          >
            <Skeleton className="w-10 h-10 rounded-lg mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Chart + Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Skeleton */}
        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="flex items-end justify-between gap-2 h-44 mb-4 px-2">
            {[40, 65, 50, 80, 60, 75].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full max-w-10 h-3" />
                <div
                  // Cambiado de secondary-200 a un fondo muted animado
                  className="w-full max-w-10 bg-muted rounded-t-md animate-pulse"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-2 pt-2 border-t border-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-3 max-w-12 mx-auto" />
            ))}
          </div>
        </div>

        {/* Recent Purchases Skeleton */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}