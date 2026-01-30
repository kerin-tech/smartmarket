'use client';

export function ShoppingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-border p-4 animate-pulse"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-1.5 bg-muted rounded-full" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-5 bg-muted rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}