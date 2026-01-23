// src/components/features/compare/CompareEmptyState.tsx

'use client';

import { Search, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CompareEmptyStateProps {
  type: 'initial' | 'no-history' | 'no-products';
  productName?: string;
}

export function CompareEmptyState({ type, productName }: CompareEmptyStateProps) {
  if (type === 'initial') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-primary-500" />
        </div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-2">
          Busca un producto
        </h2>
        <p className="text-secondary-500 max-w-xs">
          Escribe el nombre de un producto para comparar sus precios en diferentes locales
        </p>
      </div>
    );
  }

  if (type === 'no-history') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-secondary-400" />
        </div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-2">
          Sin historial de precios
        </h2>
        <p className="text-secondary-500 max-w-xs mb-6">
          {productName 
            ? `No hay compras registradas para "${productName}". Registra una compra para comenzar a comparar precios.`
            : 'Este producto no tiene compras registradas aún.'
          }
        </p>
        <Link href="/purchases">
          <Button variant="outline" leftIcon={<ShoppingCart className="h-5 w-5" />}>
            Registrar compra
          </Button>
        </Link>
      </div>
    );
  }

  // no-products
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
        <ShoppingCart className="h-8 w-8 text-secondary-400" />
      </div>
      <h2 className="text-lg font-semibold text-secondary-900 mb-2">
        Sin productos
      </h2>
      <p className="text-secondary-500 max-w-xs mb-6">
        Aún no tienes productos registrados. Agrega productos para poder comparar precios.
      </p>
      <Link href="/products">
        <Button leftIcon={<ShoppingCart className="h-5 w-5" />}>
          Agregar productos
        </Button>
      </Link>
    </div>
  );
}