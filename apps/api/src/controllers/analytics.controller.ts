// src/controllers/analytics.controller.ts

import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";

/**
 * HELPER: Calcula totales de un item de compra de forma segura y consistente.
 * Maneja los campos Decimal de Prisma convirtiéndolos a Number.
 */
const calculateItemTotals = (item: any) => {
  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const discountPercentage = Number(item.discountPercentage || 0);

  const base = quantity * unitPrice;
  const savings = base * (discountPercentage / 100);
  const total = base - savings;

  return { base, savings, total, quantity };
};

/**
 * HELPER: Formatea etiqueta de mes (ej: "2024-01" -> "Enero 2024")
 */
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * GET /api/v1/analytics/monthly
 * Obtiene métricas mensuales de compras
 */
export const getMonthlyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      include: { items: true },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, any> = {};

    // Inicializar meses
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        totalSpent: 0, totalBase: 0, totalSavings: 0, totalPurchases: 0, totalItems: 0,
      };
    }

    purchases.forEach((purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        let pBase = 0;
        let pSavings = 0;

        purchase.items.forEach((item) => {
          const { base, savings } = calculateItemTotals(item);
          pBase += base;
          pSavings += savings;
        });

        monthlyData[monthKey].totalBase += pBase;
        monthlyData[monthKey].totalSavings += pSavings;
        monthlyData[monthKey].totalSpent += (pBase - pSavings);
        monthlyData[monthKey].totalPurchases += 1;
        monthlyData[monthKey].totalItems += purchase.items.length;
      }
    });

    const monthlyAnalytics = Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        monthLabel: formatMonthLabel(month),
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalBase: Math.round(data.totalBase * 100) / 100,
        totalSavings: Math.round(data.totalSavings * 100) / 100,
        totalPurchases: data.totalPurchases,
        totalItems: data.totalItems,
        averagePerPurchase: data.totalPurchases > 0 
          ? Math.round((data.totalSpent / data.totalPurchases) * 100) / 100 
          : 0,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    const summary = {
      totalSpent: Math.round(monthlyAnalytics.reduce((sum, m) => sum + m.totalSpent, 0) * 100) / 100,
      totalBase: Math.round(monthlyAnalytics.reduce((sum, m) => sum + m.totalBase, 0) * 100) / 100,
      totalSavings: Math.round(monthlyAnalytics.reduce((sum, m) => sum + m.totalSavings, 0) * 100) / 100,
      totalPurchases: monthlyAnalytics.reduce((sum, m) => sum + m.totalPurchases, 0),
      totalItems: monthlyAnalytics.reduce((sum, m) => sum + m.totalItems, 0),
      averageMonthlySpent: Math.round((monthlyAnalytics.reduce((sum, m) => sum + m.totalSpent, 0) / months) * 100) / 100,
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      },
    };

    return successResponse(res, { monthly: monthlyAnalytics, summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/summary
 * Obtiene resumen general de todas las compras del usuario
 */
export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const monthParam = req.query.month as string | undefined;

    let dateFilter: any;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      dateFilter = { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) };
      periodLabel = formatMonthLabel(monthParam);
    }

    const [purchaseStats, storeCount, productCount] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId, ...(dateFilter && { date: dateFilter }) },
        include: { items: true },
      }),
      prisma.store.count({ where: { userId } }),
      prisma.product.count({ where: { userId } }),
    ]);

    let totalSpent = 0;
    let totalItems = 0;
    const storeSpending: Record<string, number> = {};

    purchaseStats.forEach((purchase) => {
      let pTotal = 0;
      purchase.items.forEach(item => {
        const { total } = calculateItemTotals(item);
        pTotal += total;
      });
      
      totalSpent += pTotal;
      totalItems += purchase.items.length;
      storeSpending[purchase.storeId] = (storeSpending[purchase.storeId] || 0) + pTotal;
    });

    let topStoreId: string | null = null;
    let topStoreSpending = 0;
    Object.entries(storeSpending).forEach(([id, spending]) => {
      if (spending > topStoreSpending) {
        topStoreId = id;
        topStoreSpending = spending;
      }
    });

    // 1. Tipamos el objeto para que TS no se queje de la estructura
    let topStore: { id: string; name: string; totalSpent: number } | null = null;

    if (topStoreId) {
      const store = await prisma.store.findUnique({ 
        where: { id: topStoreId }, 
        select: { id: true, name: true } 
      });

      if (store) {
        // 2. Usamos el spread y nos aseguramos de que totalSpent sea el tipo esperado
        topStore = {
          id: store.id,
          name: store.name,
          totalSpent: Math.round(topStoreSpending * 100) / 100
        };
      }
    }

    return successResponse(res, {
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalPurchases: purchaseStats.length,
      totalItems,
      totalStores: storeCount,
      totalProducts: productCount,
      averagePerPurchase: purchaseStats.length > 0 ? Math.round((totalSpent / purchaseStats.length) * 100) / 100 : 0,
      topStore,
      ...(periodLabel && { period: periodLabel }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/top-products
 */
export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 5, 1), 20);
    const monthParam = req.query.month as string | undefined;

    let dateFilter: any;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      dateFilter = { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) };
      periodLabel = formatMonthLabel(monthParam);
    }

    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { purchase: { userId, ...(dateFilter && { date: dateFilter }) } },
      include: { product: true },
    });

    const productData: Record<string, any> = {};

    purchaseItems.forEach((item) => {
      const productId = item.product.id;
      const { total, quantity } = calculateItemTotals(item);
      const unitPrice = Number(item.unitPrice);

      if (!productData[productId]) {
        productData[productId] = {
          product: item.product,
          totalSpent: 0,
          totalQuantity: 0,
          purchaseCount: 0,
          prices: [],
        };
      }

      productData[productId].totalSpent += total;
      productData[productId].totalQuantity += quantity;
      productData[productId].purchaseCount += 1;
      productData[productId].prices.push(unitPrice);
    });

    const topProducts = Object.values(productData)
      .map((data: any) => ({
        ...data.product,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalQuantity: Math.round(data.totalQuantity * 1000) / 1000,
        purchaseCount: data.purchaseCount,
        avgPrice: Math.round((data.prices.reduce((s: number, p: number) => s + p, 0) / data.prices.length) * 100) / 100,
        minPrice: Math.round(Math.min(...data.prices) * 100) / 100,
        maxPrice: Math.round(Math.max(...data.prices) * 100) / 100,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    const grandTotal = Object.values(productData).reduce((sum, p: any) => sum + p.totalSpent, 0);

    const topProductsWithPercentage = topProducts.map((product) => ({
      ...product,
      percentage: grandTotal > 0 ? Math.round((product.totalSpent / grandTotal) * 10000) / 100 : 0,
    }));

    return successResponse(res, {
      topProducts: topProductsWithPercentage,
      totalProducts: Object.keys(productData).length,
      grandTotal: Math.round(grandTotal * 100) / 100,
      ...(periodLabel && { period: periodLabel }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/by-store
 */
export const getByStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const monthParam = req.query.month as string | undefined;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    let dateFilter: any;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      dateFilter = { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) };
      periodLabel = formatMonthLabel(monthParam);
    } else {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      dateFilter = { gte: startDate };
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId, date: dateFilter },
      include: { store: true, items: true },
    });

    const storeData: Record<string, any> = {};

    purchases.forEach((purchase) => {
      const storeId = purchase.store.id;
      if (!storeData[storeId]) {
        storeData[storeId] = {
          store: purchase.store, totalSpent: 0, totalBase: 0, totalSavings: 0, totalPurchases: 0, totalItems: 0,
        };
      }

      let pBase = 0, pSavings = 0;
      purchase.items.forEach(item => {
        const { base, savings } = calculateItemTotals(item);
        pBase += base; pSavings += savings;
      });

      storeData[storeId].totalBase += pBase;
      storeData[storeId].totalSavings += pSavings;
      storeData[storeId].totalSpent += (pBase - pSavings);
      storeData[storeId].totalPurchases += 1;
      storeData[storeId].totalItems += purchase.items.length;
    });

    const byStore = Object.values(storeData)
      .map((data: any) => ({
        ...data.store,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalBase: Math.round(data.totalBase * 100) / 100,
        totalSavings: Math.round(data.totalSavings * 100) / 100,
        totalPurchases: data.totalPurchases,
        totalItems: data.totalItems,
        averagePerPurchase: data.totalPurchases > 0 ? Math.round((data.totalSpent / data.totalPurchases) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return successResponse(res, { byStore, ...(periodLabel && { period: periodLabel }) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/by-category
 */
export const getByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const monthParam = req.query.month as string | undefined;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    let dateFilter: any;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      dateFilter = { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) };
      periodLabel = formatMonthLabel(monthParam);
    } else {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      dateFilter = { gte: startDate };
    }

    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { purchase: { userId, date: dateFilter } },
      include: { product: true },
    });

    const categoryData: Record<string, any> = {};

    purchaseItems.forEach((item) => {
      const category = item.product.category;
      const { base, savings, total, quantity } = calculateItemTotals(item);

      if (!categoryData[category]) {
        categoryData[category] = { totalSpent: 0, totalBase: 0, totalSavings: 0, totalItems: 0, totalQuantity: 0 };
      }

      categoryData[category].totalBase += base;
      categoryData[category].totalSavings += savings;
      categoryData[category].totalSpent += total;
      categoryData[category].totalItems += 1;
      categoryData[category].totalQuantity += quantity;
    });

    const grandTotal = Object.values(categoryData).reduce((sum, c: any) => sum + c.totalSpent, 0);

    const byCategory = Object.entries(categoryData)
      .map(([category, data]: [string, any]) => ({
        category,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalBase: Math.round(data.totalBase * 100) / 100,
        totalSavings: Math.round(data.totalSavings * 100) / 100,
        totalItems: data.totalItems,
        totalQuantity: Math.round(data.totalQuantity * 1000) / 1000,
        percentage: grandTotal > 0 ? Math.round((data.totalSpent / grandTotal) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return successResponse(res, { byCategory, grandTotal: Math.round(grandTotal * 100) / 100, ...(periodLabel && { period: periodLabel }) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/compare-prices
 */
export const comparePrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      return errorResponse(res, 'El parámetro productId es requerido', ERROR_CODES.BAD_REQUEST.code);
    }

    const product = await prisma.product.findFirst({ where: { id: productId, userId }, select: { id: true, name: true, category: true, brand: true } });
    if (!product) return errorResponse(res, 'Producto no encontrado', ERROR_CODES.NOT_FOUND.code);

    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { productId, purchase: { userId } },
      include: { purchase: { include: { store: true } } },
      orderBy: { purchase: { date: 'desc' } },
    });

    if (purchaseItems.length === 0) {
      return successResponse(res, { product, comparison: [], bestOption: null, totalPurchases: 0 });
    }

    const storeStats: Record<string, any> = {};

    purchaseItems.forEach((item) => {
      const storeId = item.purchase.storeId;
      const unitPrice = Number(item.unitPrice);
      const purchaseDate = new Date(item.purchase.date);

      if (!storeStats[storeId]) {
        storeStats[storeId] = { store: item.purchase.store, prices: [], lastPrice: unitPrice, lastDate: purchaseDate, count: 0 };
      }

      storeStats[storeId].prices.push(unitPrice);
      storeStats[storeId].count += 1;
      if (purchaseDate > storeStats[storeId].lastDate) {
        storeStats[storeId].lastPrice = unitPrice;
        storeStats[storeId].lastDate = purchaseDate;
      }
    });

    const comparison = Object.values(storeStats)
      .map((stat: any) => {
        const minPrice = Math.min(...stat.prices);
        const maxPrice = Math.max(...stat.prices);
        const avgPrice = stat.prices.reduce((s: number, p: number) => s + p, 0) / stat.prices.length;

        return {
          store: stat.store,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          avgPrice: Math.round(avgPrice * 100) / 100,
          lastPrice: Math.round(stat.lastPrice * 100) / 100,
          lastDate: stat.lastDate.toISOString().split('T')[0],
          purchaseCount: stat.count,
          priceVariation: stat.prices.length > 1 ? Math.round(((maxPrice - minPrice) / minPrice) * 10000) / 100 : 0,
        };
      })
      .sort((a, b) => a.avgPrice - b.avgPrice);

    const bestOption = comparison.length > 0 ? {
      storeId: comparison[0].store.id,
      storeName: comparison[0].store.name,
      avgPrice: comparison[0].avgPrice,
      lastPrice: comparison[0].lastPrice,
      savings: comparison.length > 1 ? Math.round((comparison[comparison.length - 1].avgPrice - comparison[0].avgPrice) * 100) / 100 : 0,
      savingsPercentage: comparison.length > 1 ? Math.round(((comparison[comparison.length - 1].avgPrice - comparison[0].avgPrice) / comparison[comparison.length - 1].avgPrice) * 10000) / 100 : 0,
    } : null;

    const allPrices = purchaseItems.map(item => Number(item.unitPrice));
    const globalStats = {
      minPrice: Math.round(Math.min(...allPrices) * 100) / 100,
      maxPrice: Math.round(Math.max(...allPrices) * 100) / 100,
      avgPrice: Math.round((allPrices.reduce((s, p) => s + p, 0) / allPrices.length) * 100) / 100,
      totalPurchases: purchaseItems.length,
      storesCount: comparison.length,
    };

    return successResponse(res, { product, comparison, bestOption, globalStats });
  } catch (error) {
    next(error);
  }
};