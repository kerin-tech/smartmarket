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

        {/* Spending Card Skeleton */}
        <div className="bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl p-6">
          <Skeleton className="h-4 w-24 bg-primary-300 mb-2" />
          <Skeleton className="h-4 w-20 bg-primary-300 mb-3" />
          <Skeleton className="h-10 w-40 bg-primary-300 mb-4" />
          <Skeleton className="h-8 w-48 rounded-full bg-primary-300" />
        </div>
      </div>

      {/* Metrics Grid Skeleton - 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-secondary-200 p-4"
          >
            <Skeleton className="w-10 h-10 rounded-lg mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Chart + Recent Purchases - 1 col mobile, 2 cols desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Skeleton */}
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="flex items-end justify-between gap-2 h-44 mb-4">
            {[40, 65, 50, 80, 60, 75].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-10 h-3" />
                <div
                  className="w-full max-w-12 bg-secondary-200 rounded-t-md animate-pulse"
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

        {/* Recent Purchases Skeleton */}
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="divide-y divide-secondary-100">
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