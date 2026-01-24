'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [comparisonData, setComparisonData] = useState<PriceComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (selectedProduct) {
      loadComparison(selectedProduct.id);
    } else {
      setComparisonData(null);
    }
  }, [selectedProduct, loadComparison]);

  // --- LÓGICA DE CÁLCULO DE ESTADÍSTICAS ---
  const derivedStats = useMemo(() => {
    // 1. Verificamos si comparisonData existe y tiene la lista interna
    if (!comparisonData || !comparisonData.comparison) {
      return null;
    }

    const list = comparisonData.comparison;

    // 2. Extraer precios asegurando que sean números. 
    // Si item.lastPrice no existe, usamos item.avgPrice como respaldo.
    const allPrices = list.map(item => {
      const p = Number(item.lastPrice || item.avgPrice || 0);
      return isNaN(p) ? 0 : p;
    });

    if (allPrices.length === 0) return null;

    const globalMin = Math.min(...allPrices);
    const globalMax = Math.max(...allPrices);
    const globalAvg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

    // 3. Encontrar la mejor tienda
    const bestStore = [...list].sort((a, b) => {
      const priceA = Number(a.avgPrice || a.lastPrice || 0);
      const priceB = Number(b.avgPrice || b.lastPrice || 0);
      return priceA - priceB;
    })[0];

    return {
      globalStats: {
        minPrice: globalMin,
        maxPrice: globalMax,
        avgPrice: Math.round(globalAvg * 100) / 100,
        totalPurchases: list.length,
        storesCount: list.length
      },
      // En CompareView.tsx, dentro del useMemo
      bestOption: {
        storeId: bestStore.store.id,
        storeName: bestStore.store.name,
        // ASEGÚRATE DE QUE SE LLAME 'price'
        price: Number(bestStore.lastPrice || bestStore.avgPrice || 0),
        avgPrice: Number(bestStore.avgPrice || 0),
        lastDate: bestStore.lastDate
      }
    };
  }, [comparisonData]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setComparisonData(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Comparar Precios</h1>

      <ProductSelector
        selectedProduct={selectedProduct}
        onSelect={handleSelectProduct}
        onClear={handleClearProduct}
      />

      {!selectedProduct ? (
        <CompareEmptyState type="initial" />
      ) : isLoading ? (
        <CompareSkeleton />
      ) : comparisonData ? (
        <>
          <ProductCard product={comparisonData.product} />

          {comparisonData.comparison.length === 0 ? (
            <CompareEmptyState
              type="no-history"
              productName={comparisonData.product.name}
            />
          ) : (
            <>
              {/* Usamos derivedStats para la mejor opción */}
              {derivedStats && (
  <BestPriceCard bestOption={derivedStats.bestOption as any} />
)}

              <StoreComparisonList
                stores={comparisonData.comparison}
                bestStoreId={derivedStats?.bestOption.storeId}
              />

              {/* Pasamos las estadísticas calculadas al card */}
              <PriceStatsCard stats={derivedStats?.globalStats as any} />
            </>
          )}
        </>
      ) : (
        <CompareEmptyState type="no-history" />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// --- PRODUCT CARD COMPONENT ---
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

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    brand: string;
  };
}