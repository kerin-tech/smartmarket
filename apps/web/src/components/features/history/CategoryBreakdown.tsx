'use client';

import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';

// Definimos la interfaz aquí mismo para asegurar que coincida con el backend
interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
  isLoading?: boolean;
}

export function CategoryBreakdown({ categories, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return <CategoryBreakdownSkeleton />;
  }

  if (categories.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Gastos por categoría
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay datos de categorías para este mes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-6">
        Gastos por categoría
      </h3>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryName = category.name;
          const config = getCategoryConfig(categoryName);
          const CategoryIcon = config.icon || ShoppingCart;

          return (
            <div key={categoryName} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* Icono corregido con estilo consistente */}
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <CategoryIcon className="h-4.5 w-4.5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(category.amount)}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-primary-600"
                    style={{ width: `${category.percentage}%` }}
                    role="progressbar"
                    aria-valuenow={category.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-10 text-right">
                  {Math.round(category.percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBreakdownSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="h-5 w-40 bg-secondary-200 rounded animate-pulse mb-6" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`skeleton-${i}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-secondary-200 rounded-lg animate-pulse" />
                <div className="w-24 h-4 bg-secondary-200 rounded animate-pulse" />
              </div>
              <div className="w-20 h-4 bg-secondary-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full" />
              <div className="w-10 h-3 bg-secondary-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}