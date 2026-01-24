// src/components/features/compare/CompareView.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';

import { ProductSelector } from './ProductSelector';
import { BestPriceCard } from './BestPriceCard';
import { StoreComparisonList } from './StoreComparisonList';
import { PriceStatsCard } from './PriceStatsCard';
import { CompareEmptyState } from './CompareEmptyState';
import { CompareSkeleton } from './CompareSkeleton';
import { ToastContainer } from '@/components/ui/Toast';

import { useToast } from '@/hooks/useToast';
import { analyticsService } from '@/services/analytics.service';
import { getCategoryConfig } from '@/types/product.types';
import type { Product } from '@/types/product.types';
import type { PriceComparisonResponse } from '@/types/analytics.types';

export function CompareView() {
  const { toasts, removeToast, error: showError } = useToast();

  // Estados
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [comparisonData, setComparisonData] = useState<PriceComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos de comparación cuando se selecciona un producto
  const loadComparison = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await analyticsService.comparePrices(productId);
      setComparisonData(data);
    } catch (err: any) {
      showError(err.message || 'Error al cargar la comparación de precios');
      setComparisonData(null);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Cuando cambia el producto seleccionado
  useEffect(() => {
    if (selectedProduct) {
      loadComparison(selectedProduct.id);
    } else {
      setComparisonData(null);
    }
  }, [selectedProduct, loadComparison]);

  // Manejar selección de producto
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Manejar clear de producto
  const handleClearProduct = () => {
    setSelectedProduct(null);
    setComparisonData(null);
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <h1 className="text-2xl font-bold text-foreground">Comparar Precios</h1>

      {/* Selector de producto */}
      <ProductSelector
        selectedProduct={selectedProduct}
        onSelect={handleSelectProduct}
        onClear={handleClearProduct}
      />

      {/* Contenido basado en estado */}
      {!selectedProduct ? (
        // Estado inicial - sin producto seleccionado
        <CompareEmptyState type="initial" />
      ) : isLoading ? (
        // Loading
        <CompareSkeleton />
      ) : comparisonData ? (
        // Datos cargados
        <>
          {/* Card del producto */}
          <ProductCard product={comparisonData.product} />

          {comparisonData.comparison.length === 0 ? (
            // Sin historial de precios
            <CompareEmptyState 
              type="no-history" 
              productName={comparisonData.product.name} 
            />
          ) : (
            <>
              {/* Mejor precio */}
              {comparisonData.bestOption && (
                <BestPriceCard bestOption={comparisonData.bestOption} />
              )}

              {/* Comparativa por local */}
              <StoreComparisonList
                stores={comparisonData.comparison}
                bestStoreId={comparisonData.bestOption?.storeId}
              />

              {/* Estadísticas */}
              <PriceStatsCard stats={comparisonData.globalStats} />
            </>
          )}
        </>
      ) : (
        // Error o sin datos
        <CompareEmptyState type="no-history" />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// Componente interno para mostrar card del producto
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    brand: string;
  };
}

function ProductCard({ product }: ProductCardProps) {
  const config = getCategoryConfig(product.category);

  return (
    <div className="bg-card rounded-xl border border-color p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
          {config.emoji}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
          <p className="text-sm text-muted-foreground">
            {config.label} · {product.brand}
          </p>
        </div>
      </div>
    </div>
  );
}