// src/components/features/compare/CompareSkeleton.tsx

'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function CompareSkeleton() {
  return (
    <div className="space-y-6">
      {/* Product Card Skeleton */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Best Price Card Skeleton */}
      <div className="bg-success-50 border border-success-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-8 h-8 rounded-lg bg-success-200" />
          <Skeleton className="h-4 w-24 bg-success-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-success-200" />
            <Skeleton className="h-8 w-28 bg-success-200" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-24 bg-success-200 ml-auto" />
            <Skeleton className="h-4 w-20 bg-success-200 ml-auto" />
          </div>
        </div>
      </div>

      {/* Store List Skeleton */}
      <div className="bg-white rounded-xl border border-secondary-200 p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="text-right space-y-1.5">
                <Skeleton className="h-5 w-20 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Card Skeleton */}
      <div className="bg-white rounded-xl border border-secondary-200 p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-2" />
              <Skeleton className="h-6 w-20 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}