// src/components/features/history/StoreBreakdown.tsx

'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp, Package, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { StoreBreakdown as StoreBreakdownType } from '@/types/analytics.types';

interface StoreBreakdownProps {
  stores: StoreBreakdownType[];
  totalSpent: number;
  isLoading?: boolean;
}

export function StoreBreakdown({ stores, totalSpent, isLoading }: StoreBreakdownProps) {
  const [expandedStore, setExpandedStore] = useState<string | null>(null);

  const toggleStore = (storeId: string) => {
    setExpandedStore(expandedStore === storeId ? null : storeId);
  };

  if (isLoading) return <StoreBreakdownSkeleton />;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm w-full overflow-hidden h-full">
      <h3 className="text-md font-bold text-foreground mb-6">Gastos por local</h3>

      <div className="space-y-4">
        {stores.map((store) => {
          const percentage = totalSpent > 0 
            ? Math.min(Math.round((store.totalSpent / totalSpent) * 100), 100) 
            : 0;
          const isExpanded = expandedStore === store.id;

          return (
            <div key={store.id} className={`rounded-xl border transition-all duration-200 overflow-hidden w-full ${
              isExpanded ? 'border-primary-400 bg-primary-50/5 ring-1 ring-primary-100' : 'border-border'
            }`}>
              
              {/* Header Tienda: Aplicamos Grid para evitar desborde */}
              <button 
                onClick={() => toggleStore(store.id)} 
                className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={`shrink-0 flex items-center justify-center rounded-xl transition-colors
                  w-12 h-12 min-w-[3rem] sm:w-12 sm:h-12
                  ${isExpanded ? 'bg-primary-200 text-white' : 'bg-primary-100 text-primary-600'}`}
                >
                  <MapPin className="h-6 w-6 sm:h-4 sm:w-4" />
                </div>

                <div className="min-w-0"> {/* min-w-0 permite que el truncate funcione en Grid */}
                  <h4 className="text-md sm:text-lg font-medium text-foreground truncate tracking-tight">
                    {store.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{store.totalPurchases} compras</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(store.totalSpent)}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-primary-600">{percentage}%</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground shrink-0" />
                  )}
                </div>
              </button>

              {/* Detalle de productos */}
              {isExpanded && (
                <div className="bg-muted/20 border-t border-border/50 w-full overflow-hidden">
                  <div className="max-h-[450px] overflow-y-auto p-4 space-y-5 custom-scrollbar">
                    {store.purchases.map((purchase) => (
                      <div key={purchase.id} className="bg-card rounded-lg border border-border/60 overflow-hidden w-full">
                        <div className="bg-muted/40 px-4 py-2.5 border-b border-border/50 flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
                            {new Date(purchase.date).toLocaleDateString('es-CO', { 
                              day: '2-digit', month: 'short', year: 'numeric' 
                            })}
                          </span>
                          <span className="text-sm font-bold text-primary-700">
                            {formatCurrency(purchase.total)}
                          </span>
                        </div>
                        
                        <div className="divide-y divide-border/30">
                          {purchase.items.map((item: any) => (
                            /* Grid para anclar nombre a la izquierda y precio a la derecha */
                            <div key={item.id} className="grid grid-cols-[1fr_auto] items-center p-4 gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <Package className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                                <p className="text-sm sm:text-base font-medium text-foreground truncate">
                                  <span className="font-bold text-primary-600">{item.quantity}x</span> {item.productName}
                                </p>
                              </div>
                              
                              <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                                {item.discountPercentage > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-success-800 bg-success-100 px-2 py-0.5 rounded uppercase">
                                    <Tag className="h-3 w-3" />
                                    {item.discountPercentage}%
                                  </span>
                                )}
                                <span className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                                  item.discountPercentage > 0 ? 'text-success-600' : 'text-foreground'
                                }`}>
                                  {formatCurrency(item.total)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoreBreakdownSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full w-full">
      <div className="h-7 w-48 bg-secondary-200 rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-secondary-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}