// src/types/dashboard.types.ts

export interface DashboardSummary {
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
  period?: string;
}

export interface MonthlyChartData {
  month: string;
  monthLabel: string;
  totalSpent: number;
  totalPurchases: number;
  totalItems: number;
  averagePerPurchase: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  totalSpent: number;
  totalQuantity: number;
  purchaseCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  percentage: number;
}

export interface RecentPurchase {
  id: string;
  date: string;
  store: {
    id: string;
    name: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      name: string;
      category: string;
    };
  }[];
  total: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  previousMonthSummary: DashboardSummary | null;
  monthlyChart: MonthlyChartData[];
  topProducts: TopProduct[];
  recentPurchases: RecentPurchase[];
}