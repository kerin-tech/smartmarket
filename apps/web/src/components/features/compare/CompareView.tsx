'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';

import { ProductSelector } from './ProductSelector';
import { BestPriceCard } from './BestPriceCard';
import { StoreComparisonList } from './StoreComparisonList';
import { PriceStatsCard } from './PriceStatsCard';
import { CompareEmptyState } from './CompareEmptyState';
import { CompareSkeleton } from './CompareSkeleton';
import { PriceHistoryTimeline } from './PriceHistoryTimeline'; // Nuevo Componente
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

  const derivedStats = useMemo(() => {
    if (!comparisonData || !comparisonData.comparison || comparisonData.comparison.length === 0) return null;

    const list = comparisonData.comparison;
    const globalMin = Math.min(...list.map(item => Number(item.minPrice)));
    const globalMax = Math.max(...list.map(item => Number(item.maxPrice)));
    const globalAvg = list.reduce((acc, item) => acc + Number(item.avgPrice), 0) / list.length;

    const bestStore = [...list].sort((a, b) =>
      Number(a.minPrice) - Number(b.minPrice)
    )[0] as any;
    const bestPrice = Number(bestStore.minPrice);

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
          {/* Contenedor Sticky: 
              - top-20: Ajuste para quedar debajo del header (aprox 80px). 
              - z-30: Para asegurar que esté por encima de otros elementos al hacer scroll.
          */}
          <div className="sticky top-20 z-30 mb-6">
            <ProductCard product={comparisonData.product} />
          </div>

          {comparisonData.comparison.length === 0 ? (
            <CompareEmptyState
              type="no-history"
              productName={comparisonData.product.name}
            />
          ) : (
            <>
              {derivedStats && (
                <BestPriceCard bestOption={derivedStats.bestOption as any} />
              )}

              <StoreComparisonList
                stores={comparisonData.comparison}
                bestStoreId={derivedStats?.bestOption.storeId}
              />

              {comparisonData.history && comparisonData.history.length > 0 && (
                <PriceHistoryTimeline history={comparisonData.history} />
              )}

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

// --- PRODUCT CARD COMPONENT (CON COLORES ORIGINALES) ---
function ProductCard({ product }: ProductCardProps) {
  const config = getCategoryConfig(product.category);
  const CategoryIcon = config.icon || ShoppingCart;

  return (
    /* bg-card/95 y backdrop-blur para que al flotar sobre el contenido se vea pulido */
    <div className="bg-card rounded-xl border border-border p-4 shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <CategoryIcon className="h-6 w-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">{product.name}</h2>
          <p className="text-sm text-muted-foreground">
            {config.label} {product.brand && `· ${product.brand}`}
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