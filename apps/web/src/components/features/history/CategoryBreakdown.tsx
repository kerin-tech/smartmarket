'use client';

import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';

// Definimos la interfaz aquí mismo para asegurar que coincida con el backend
interface CategoryData {
  name: string;      // Lo que envía el backend ahora
  amount: number;    // Lo que envía el backend ahora
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryData[]; // Usamos nuestra interfaz corregida
  isLoading?: boolean;
}

// Colores para las barras de progreso
const categoryColors: Record<string, string> = {
  'Frutas': 'bg-orange-500',
  'Verduras': 'bg-green-500',
  'Granos': 'bg-yellow-500',
  'Lácteos': 'bg-sky-500',
  'Carnes': 'bg-red-500',
  'Bebidas': 'bg-violet-500',
  'Limpieza': 'bg-cyan-500',
  'Otros': 'bg-gray-500',
};

export function CategoryBreakdown({ categories, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return <CategoryBreakdownSkeleton />;
  }

  if (categories.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-color p-6">
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
    <div className="bg-card rounded-xl border border-color p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Gastos por categoría
      </h3>

      <div className="space-y-4">
        {categories.map((category) => {
          // Ahora 'name' es seguro porque definimos CategoryData
          const categoryName = category.name;
          const config = getCategoryConfig(categoryName);
          const barColor = categoryColors[categoryName] || 'bg-gray-500';

          return (
            <div key={categoryName} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.emoji}</span>
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(category.amount)}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${category.percentage}%` }}
                    role="progressbar"
                    aria-valuenow={category.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                  {category.percentage}%
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
    <div className="bg-card rounded-xl border border-color p-6">
      <div className="h-5 w-40 bg-secondary-200 rounded animate-pulse mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`skeleton-${i}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-secondary-200 rounded animate-pulse" />
                <div className="w-20 h-4 bg-secondary-200 rounded animate-pulse" />
              </div>
              <div className="w-24 h-4 bg-secondary-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-muted rounded-full" />
              <div className="w-10 h-3 bg-secondary-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}