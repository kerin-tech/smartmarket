// src/components/ui/Skeleton.tsx
// Agregar este componente a tu archivo existente de Skeleton

'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-secondary-200',
        className
      )}
    />
  );
}

interface ProductListSkeletonProps {
  count?: number;
}

export function ProductListSkeleton({ count = 6 }: ProductListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-secondary-200"
        >
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

interface StoreListSkeletonProps {
  count?: number;
}

export function StoreListSkeleton({ count = 6 }: StoreListSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden divide-y divide-secondary-100">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4"
        >
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

interface PurchaseListSkeletonProps {
  count?: number;
}

export function PurchaseListSkeleton({ count = 6 }: PurchaseListSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden divide-y divide-secondary-100">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4"
        >
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}