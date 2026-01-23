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