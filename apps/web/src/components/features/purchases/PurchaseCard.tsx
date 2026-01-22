// src/components/features/purchases/PurchaseCard.tsx

'use client';

import { ChevronRight, MapPin, Calendar, Package } from 'lucide-react';
import { formatCurrency, formatDateLong } from '@/utils/formatters';
import type { Purchase } from '@/types/purchase.types';

interface PurchaseCardProps {
  purchase: Purchase;
  onClick: (purchase: Purchase) => void;
  searchMatch?: string;
}

export function PurchaseCard({ purchase, onClick, searchMatch }: PurchaseCardProps) {
  return (
    <button
      onClick={() => onClick(purchase)}
      className="w-full flex items-center gap-4 p-4 bg-white hover:bg-secondary-50 transition-colors text-left border-b border-secondary-100 last:border-b-0"
    >
      {/* Store icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
        <MapPin className="h-6 w-6 text-primary-600" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-secondary-900 truncate">
          {purchase.store.name}
        </h3>
        <p className="text-sm text-secondary-500 mt-0.5">
          {formatDateLong(purchase.date)}
        </p>
        
        {/* Search match hint */}
        {searchMatch && (
          <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
            <Package className="h-3 w-3" />
            Contiene: {searchMatch}
          </p>
        )}
        
        {/* Items count and total */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-secondary-600">
            {purchase.itemCount} {purchase.itemCount === 1 ? 'producto' : 'productos'}
          </span>
          <span className="text-sm font-semibold text-secondary-900">
            {formatCurrency(purchase.total)}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-5 w-5 text-secondary-400 flex-shrink-0" />
    </button>
  );
}