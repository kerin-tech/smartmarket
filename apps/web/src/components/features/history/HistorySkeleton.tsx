// src/components/features/history/HistorySkeleton.tsx

'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function HistorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Month Selector Skeleton */}
      <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>

      {/* Summary Card Skeleton - LIMPIO (Sin colores chillonas) */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
        <div className="text-center mb-6 space-y-2">
          <Skeleton className="w-24 h-4 mx-auto opacity-60" />
          <Skeleton className="w-48 h-10 mx-auto" />
        </div>
        
        <div className="flex justify-center mb-6">
          <Skeleton className="w-36 h-8 rounded-full" />
        </div>

        {/* Estadísticas inferiores */}
        <div className="flex justify-center gap-8 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="w-8 h-5" />
              <Skeleton className="w-12 h-3 opacity-50" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="w-8 h-5" />
              <Skeleton className="w-12 h-3 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de secciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown Skeleton */}
        <div className="bg-card rounded-xl border border-border p-6">
          <Skeleton className="w-40 h-5 mb-6" />
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <Skeleton className="w-24 h-4" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="flex-1 h-2 rounded-full" />
                  <Skeleton className="w-8 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Breakdown Skeleton */}
        <div className="bg-card rounded-xl border border-border p-6">
          <Skeleton className="w-32 h-5 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="w-28 h-4" />
                      <Skeleton className="w-16 h-3 opacity-50" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="w-20 h-4 ml-auto" />
                      <Skeleton className="w-10 h-3 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart Skeleton */}
      <div className="bg-card rounded-xl border border-border p-6">
        <Skeleton className="w-48 h-5 mb-8" />
        <div className="flex items-end justify-between gap-3 h-40 mb-4 px-2">
          {[40, 65, 30, 80, 55, 70].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <Skeleton className="w-full max-w-10 h-3" />
              <div
                className="w-full max-w-10 rounded-t-lg bg-muted animate-pulse"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-4 border-t border-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-3 max-w-12 mx-auto" />
          ))}
        </div>
      </div>
    </div>
  );
}