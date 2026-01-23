// src/components/features/history/HistorySkeleton.tsx

'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function HistorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Month Selector Skeleton */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-secondary-200 p-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>

      {/* Summary Card Skeleton */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl p-6">
        <div className="text-center mb-4 space-y-2">
          <Skeleton className="w-24 h-4 mx-auto bg-primary-300" />
          <Skeleton className="w-40 h-10 mx-auto bg-primary-300" />
        </div>
        <div className="flex justify-center mb-4">
          <Skeleton className="w-36 h-8 rounded-full bg-primary-300" />
        </div>
        <div className="flex justify-center gap-6 pt-4 border-t border-primary-300/30">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-lg bg-primary-300" />
            <div className="space-y-1">
              <Skeleton className="w-8 h-6 bg-primary-300" />
              <Skeleton className="w-12 h-3 bg-primary-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-lg bg-primary-300" />
            <div className="space-y-1">
              <Skeleton className="w-8 h-6 bg-primary-300" />
              <Skeleton className="w-12 h-3 bg-primary-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de secciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown Skeleton */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <Skeleton className="w-40 h-5 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <Skeleton className="w-24 h-4" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="flex-1 h-2.5 rounded-full" />
                  <Skeleton className="w-10 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Breakdown Skeleton */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <Skeleton className="w-32 h-5 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Skeleton className="w-28 h-4" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="w-24 h-4" />
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
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <Skeleton className="w-48 h-5 mb-6" />
        <div className="flex items-end justify-between gap-2 h-40 mb-4">
          {[40, 65, 30, 80, 55, 70].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-12 h-3" />
              <div
                className="w-full max-w-12 rounded-t-md bg-secondary-200 animate-pulse"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-2 border-t border-secondary-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-3 max-w-12 mx-auto" />
          ))}
        </div>
      </div>
    </div>
  );
}