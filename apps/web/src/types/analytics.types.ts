// src/types/analytics.types.ts

export interface MonthlyData {
  month: string;
  monthLabel: string;
  totalSpent: number;
  totalPurchases: number;
  totalItems: number;
  averagePerPurchase: number;
}

export interface MonthlySummary {
  totalSpent: number;
  totalPurchases: number;
  totalItems: number;
  averageMonthlySpent: number;
  period: {
    months: number;
    startDate: string;
    endDate: string;
  };
}

export interface MonthlyAnalyticsResponse {
  monthly: MonthlyData[];
  summary: MonthlySummary;
}

export interface SummaryResponse {
  totalSpent: number;
  totalPurchases: number;
  totalItems: number;
  totalStores: number;
  totalProducts: number;
  averagePerPurchase: number;
  topStore: {
    id: string;
    name: string;
    totalSpent: number;
  } | null;
}

export interface StoreBreakdown {
  id: string;
  name: string;
  location: string;
  totalSpent: number;
  totalPurchases: number;
  totalItems: number;
  averagePerPurchase: number;
}

export interface ByStoreResponse {
  byStore: StoreBreakdown[];
  period: {
    months: number;
    startDate: string;
  };
}

export interface CategoryBreakdown {
  category: string;
  totalSpent: number;
  totalItems: number;
  totalQuantity: number;
  percentage: number;
}

export interface ByCategoryResponse {
  byCategory: CategoryBreakdown[];
  grandTotal: number;
  period: {
    months: number;
    startDate: string;
  };
}

// Para la vista de historial de un mes específico
export interface MonthHistory {
  month: string;
  monthLabel: string;
  total: number;
  purchaseCount: number;
  productCount: number;
  comparison: {
    previousMonth: string;
    percentage: number;
    direction: 'up' | 'down' | 'equal';
  } | null;
  byCategory: CategoryBreakdown[];
  byStore: StoreBreakdown[];
  trend: MonthlyData[];
}

// Para comparativo de precios
export interface PriceComparisonStore {
  store: {
    id: string;
    name: string;
    location: string;
  };
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  lastPrice: number;
  lastDate: string;
  purchaseCount: number;
  priceVariation: number;
}

export interface PriceComparisonProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
}

export interface PriceComparisonBestOption {
  storeId: string;
  storeName: string;
  avgPrice: number;
  lastPrice: number;
  savings: number;
  savingsPercentage: number;
}

export interface PriceComparisonGlobalStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalPurchases: number;
  storesCount: number;
}

export interface PriceComparisonResponse {
  product: PriceComparisonProduct;
  comparison: PriceComparisonStore[];
  bestOption: PriceComparisonBestOption | null;
  globalStats: PriceComparisonGlobalStats;
}