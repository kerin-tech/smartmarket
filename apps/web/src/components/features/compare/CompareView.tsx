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

  // --- LÓGICA DE CÁLCULO DE ESTADÍSTICAS CORREGIDA ---
  const derivedStats = useMemo(() => {
    if (!comparisonData || !comparisonData.comparison || comparisonData.comparison.length === 0) return null;

    const list = comparisonData.comparison;
    const globalMin = Math.min(...list.map(item => Number(item.minPrice)));
    const globalMax = Math.max(...list.map(item => Number(item.maxPrice)));
    const globalAvg = list.reduce((acc, item) => acc + Number(item.avgPrice), 0) / list.length;

    // Encontrar la mejor tienda por minPrice
    const bestStore = [...list].sort((a, b) =>
      Number(a.minPrice) - Number(b.minPrice)
    )[0] as any;
    const bestPrice = Number(bestStore.minPrice);

    // --- CÁLCULO DE AHORROS ---
    const savings = globalAvg > bestPrice ? globalAvg - bestPrice : 0;
    const savingsPercentage = globalAvg > 0 ? Math.round((savings / globalAvg) * 100) : 0;

    return {
      globalStats: {
        minPrice: globalMin,
        maxPrice: globalMax,
        avgPrice: Math.round(globalAvg * 100) / 100,
        totalPurchases: list.reduce((acc, item) => acc + (item.purchaseCount || 0), 0),
        storesCount: list.length
      },
      bestOption: {
        storeId: bestStore.store.id,
        storeName: bestStore.store.name,
        price: Number(bestStore.minPrice),
        lastPrice: Number(bestStore.lastPrice),
        savings: savings,
        savingsPercentage: savingsPercentage,
        trend: bestStore.trend,
        // Asegúrate de que se llame lastDate y no minPriceDate
        lastDate: String(bestStore.minPriceDate),
        purchaseCount: bestStore.purchaseCount
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