// src/controllers/analytics.controller.ts

import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";

/**
 * GET /api/v1/analytics/monthly
 * Obtiene métricas mensuales de compras
 * Query params:
 *   - months: número de meses a retornar (default: 6, max: 24)
 */
export const getMonthlyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    // Calcular fecha de inicio (N meses atrás desde el primer día del mes actual)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Obtener todas las compras del período
    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar por mes
    const monthlyData: Record<string, { 
      totalSpent: number; 
      totalPurchases: number;
      totalItems: number;
    }> = {};

    // Inicializar todos los meses del período (incluso los vacíos)
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        totalSpent: 0,
        totalPurchases: 0,
        totalItems: 0,
      };
    }

    // Calcular métricas por mes
    purchases.forEach((purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        const purchaseTotal = purchase.items.reduce(
          (sum, item) => sum + parseFloat(item.quantity.toString()) * parseFloat(item.unitPrice.toString()),
          0
        );
        
        monthlyData[monthKey].totalSpent += purchaseTotal;
        monthlyData[monthKey].totalPurchases += 1;
        monthlyData[monthKey].totalItems += purchase.items.length;
      }
    });

    // Convertir a array ordenado (más reciente primero)
    const monthlyAnalytics = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        monthLabel: formatMonthLabel(month),
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalPurchases: data.totalPurchases,
        totalItems: data.totalItems,
        averagePerPurchase: data.totalPurchases > 0 
          ? Math.round((data.totalSpent / data.totalPurchases) * 100) / 100 
          : 0,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    // Calcular totales generales
    const summary = {
      totalSpent: Math.round(monthlyAnalytics.reduce((sum, m) => sum + m.totalSpent, 0) * 100) / 100,
      totalPurchases: monthlyAnalytics.reduce((sum, m) => sum + m.totalPurchases, 0),
      totalItems: monthlyAnalytics.reduce((sum, m) => sum + m.totalItems, 0),
      averageMonthlySpent: Math.round(
        (monthlyAnalytics.reduce((sum, m) => sum + m.totalSpent, 0) / months) * 100
      ) / 100,
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      },
    };

    return successResponse(res, {
      monthly: monthlyAnalytics,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/summary
 * Obtiene resumen general de todas las compras del usuario
 * Query params:
 *   - month: filtrar por mes específico (formato YYYY-MM, opcional)
 */
export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const monthParam = req.query.month as string | undefined;

    // Calcular rango de fechas si se especifica mes
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1); // Primer día del siguiente mes
      dateFilter = { gte: startDate, lt: endDate };
      periodLabel = formatMonthLabel(monthParam);
    }

    // Obtener conteos y totales
    const [purchaseStats, storeCount, productCount] = await Promise.all([
      // Stats de compras
      prisma.purchase.findMany({
        where: { 
          userId,
          ...(dateFilter && { date: dateFilter }),
        },
        include: { items: true },
      }),
      // Conteo de tiendas (total del usuario, no filtrado por mes)
      prisma.store.count({
        where: { userId },
      }),
      // Conteo de productos (total del usuario, no filtrado por mes)
      prisma.product.count({
        where: { userId },
      }),
    ]);

    // Calcular totales
    let totalSpent = 0;
    let totalItems = 0;
    const storeSpending: Record<string, number> = {};

    purchaseStats.forEach((purchase) => {
      const purchaseTotal = purchase.items.reduce(
        (sum, item) => sum + parseFloat(item.quantity.toString()) * parseFloat(item.unitPrice.toString()),
        0
      );
      totalSpent += purchaseTotal;
      totalItems += purchase.items.length;
      
      // Acumular por tienda
      storeSpending[purchase.storeId] = (storeSpending[purchase.storeId] || 0) + purchaseTotal;
    });

    // Encontrar la tienda donde más se gasta
    let topStoreId: string | null = null;
    let topStoreSpending = 0;
    Object.entries(storeSpending).forEach(([storeId, spending]) => {
      if (spending > topStoreSpending) {
        topStoreId = storeId;
        topStoreSpending = spending;
      }
    });

    // Obtener nombre de la tienda top
    let topStore: { id: string; name: string; totalSpent: number } | null = null;
    if (topStoreId) {
      const store = await prisma.store.findUnique({
        where: { id: topStoreId },
        select: { id: true, name: true },
      });
      if (store) {
        topStore = {
          ...store,
          totalSpent: Math.round(topStoreSpending * 100) / 100,
        };
      }
    }

    return successResponse(res, {
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalPurchases: purchaseStats.length,
      totalItems,
      totalStores: storeCount,
      totalProducts: productCount,
      averagePerPurchase: purchaseStats.length > 0 
        ? Math.round((totalSpent / purchaseStats.length) * 100) / 100 
        : 0,
      topStore,
      ...(periodLabel && { period: periodLabel }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/top-products
 * Obtiene los productos más comprados ordenados por gasto total
 * Query params:
 *   - limit: número de productos a retornar (default: 5, max: 20)
 *   - month: filtrar por mes específico (formato YYYY-MM, opcional)
 */
export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 5, 1), 20);
    const monthParam = req.query.month as string | undefined;

    // Calcular rango de fechas si se especifica mes
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      dateFilter = { gte: startDate, lt: endDate };
      periodLabel = formatMonthLabel(monthParam);
    }

    // Obtener items de compras con productos
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: {
        purchase: {
          userId,
          ...(dateFilter && { date: dateFilter }),
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true,
          },
        },
      },
    });

    // Agrupar por producto
    const productData: Record<string, {
      product: {
        id: string;
        name: string;
        category: string;
        brand: string;
      };
      totalSpent: number;
      totalQuantity: number;
      purchaseCount: number;
      avgPrice: number;
      prices: number[];
    }> = {};

    purchaseItems.forEach((item) => {
      const productId = item.product.id;
      const quantity = parseFloat(item.quantity.toString());
      const unitPrice = parseFloat(item.unitPrice.toString());
      const itemTotal = quantity * unitPrice;

      if (!productData[productId]) {
        productData[productId] = {
          product: item.product,
          totalSpent: 0,
          totalQuantity: 0,
          purchaseCount: 0,
          avgPrice: 0,
          prices: [],
        };
      }

      productData[productId].totalSpent += itemTotal;
      productData[productId].totalQuantity += quantity;
      productData[productId].purchaseCount += 1;
      productData[productId].prices.push(unitPrice);
    });

    // Calcular promedios y ordenar por gasto total
    const topProducts = Object.values(productData)
      .map((data) => ({
        ...data.product,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalQuantity: Math.round(data.totalQuantity * 1000) / 1000,
        purchaseCount: data.purchaseCount,
        avgPrice: Math.round((data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length) * 100) / 100,
        minPrice: Math.round(Math.min(...data.prices) * 100) / 100,
        maxPrice: Math.round(Math.max(...data.prices) * 100) / 100,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    // Calcular total general para porcentajes
    const grandTotal = Object.values(productData).reduce((sum, p) => sum + p.totalSpent, 0);

    // Agregar porcentaje a cada producto
    const topProductsWithPercentage = topProducts.map((product) => ({
      ...product,
      percentage: grandTotal > 0 
        ? Math.round((product.totalSpent / grandTotal) * 10000) / 100 
        : 0,
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
 * Obtiene gastos agrupados por tienda
 */
export const getByStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    // Obtener compras con tiendas
    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      include: {
        store: {
          select: { id: true, name: true, location: true },
        },
        items: true,
      },
    });

    // Agrupar por tienda
    const storeData: Record<string, {
      store: { id: string; name: string; location: string };
      totalSpent: number;
      totalPurchases: number;
      totalItems: number;
    }> = {};

    purchases.forEach((purchase) => {
      const storeId = purchase.store.id;
      
      if (!storeData[storeId]) {
        storeData[storeId] = {
          store: purchase.store,
          totalSpent: 0,
          totalPurchases: 0,
          totalItems: 0,
        };
      }

      const purchaseTotal = purchase.items.reduce(
        (sum, item) => sum + parseFloat(item.quantity.toString()) * parseFloat(item.unitPrice.toString()),
        0
      );

      storeData[storeId].totalSpent += purchaseTotal;
      storeData[storeId].totalPurchases += 1;
      storeData[storeId].totalItems += purchase.items.length;
    });

    // Convertir a array y ordenar por gasto
    const byStore = Object.values(storeData)
      .map((data) => ({
        ...data.store,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalPurchases: data.totalPurchases,
        totalItems: data.totalItems,
        averagePerPurchase: data.totalPurchases > 0
          ? Math.round((data.totalSpent / data.totalPurchases) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return successResponse(res, {
      byStore,
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/by-category
 * Obtiene gastos agrupados por categoría de producto
 */
export const getByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    // Obtener items de compras con productos
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: {
        purchase: {
          userId,
          date: { gte: startDate },
        },
      },
      include: {
        product: {
          select: { category: true },
        },
      },
    });

    // Agrupar por categoría
    const categoryData: Record<string, {
      totalSpent: number;
      totalItems: number;
      totalQuantity: number;
    }> = {};

    purchaseItems.forEach((item) => {
      const category = item.product.category;
      
      if (!categoryData[category]) {
        categoryData[category] = {
          totalSpent: 0,
          totalItems: 0,
          totalQuantity: 0,
        };
      }

      const quantity = parseFloat(item.quantity.toString());
      const unitPrice = parseFloat(item.unitPrice.toString());

      categoryData[category].totalSpent += quantity * unitPrice;
      categoryData[category].totalItems += 1;
      categoryData[category].totalQuantity += quantity;
    });

    // Calcular total para porcentajes
    const grandTotal = Object.values(categoryData).reduce((sum, c) => sum + c.totalSpent, 0);

    // Convertir a array con porcentajes
    const byCategory = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalItems: data.totalItems,
        totalQuantity: Math.round(data.totalQuantity * 1000) / 1000,
        percentage: grandTotal > 0 
          ? Math.round((data.totalSpent / grandTotal) * 10000) / 100 
          : 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return successResponse(res, {
      byCategory,
      grandTotal: Math.round(grandTotal * 100) / 100,
      period: {
        months,
        startDate: startDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper para formatear etiqueta de mes
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * GET /api/v1/analytics/compare-prices
 * Compara precios de un producto en diferentes tiendas
 * Query params:
 *   - productId: UUID del producto (requerido)
 */
export const comparePrices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.query;

    // Validar que se envió productId
    if (!productId || typeof productId !== 'string') {
      return errorResponse(
        res,
        'El parámetro productId es requerido',
        ERROR_CODES.BAD_REQUEST.code
      );
    }

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
      },
    });

    if (!product) {
      return errorResponse(
        res,
        'Producto no encontrado',
        ERROR_CODES.NOT_FOUND.code
      );
    }

    // Obtener todos los items de compra para este producto
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: {
        productId,
        purchase: {
          userId,
        },
      },
      include: {
        purchase: {
          select: {
            id: true,
            date: true,
            storeId: true,
            store: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: {
        purchase: {
          date: 'desc',
        },
      },
    });

    // Si no hay compras del producto
    if (purchaseItems.length === 0) {
      return successResponse(res, {
        product,
        comparison: [],
        bestOption: null,
        totalPurchases: 0,
        message: 'No hay compras registradas para este producto',
      });
    }

    // Agrupar por tienda y calcular estadísticas
    const storeStats: Record<string, {
      store: { id: string; name: string; location: string };
      prices: number[];
      lastPrice: number;
      lastDate: Date;
      count: number;
    }> = {};

    purchaseItems.forEach((item) => {
      const storeId = item.purchase.storeId;
      const unitPrice = parseFloat(item.unitPrice.toString());
      const purchaseDate = new Date(item.purchase.date);

      if (!storeStats[storeId]) {
        storeStats[storeId] = {
          store: item.purchase.store,
          prices: [],
          lastPrice: unitPrice,
          lastDate: purchaseDate,
          count: 0,
        };
      }

      storeStats[storeId].prices.push(unitPrice);
      storeStats[storeId].count += 1;

      // Actualizar último precio si esta compra es más reciente
      if (purchaseDate > storeStats[storeId].lastDate) {
        storeStats[storeId].lastPrice = unitPrice;
        storeStats[storeId].lastDate = purchaseDate;
      }
    });

    // Calcular estadísticas y formatear respuesta
    const comparison = Object.values(storeStats)
      .map((stat) => {
        const prices = stat.prices;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

        return {
          store: stat.store,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          avgPrice: Math.round(avgPrice * 100) / 100,
          lastPrice: Math.round(stat.lastPrice * 100) / 100,
          lastDate: stat.lastDate.toISOString().split('T')[0],
          purchaseCount: stat.count,
          priceVariation: prices.length > 1
            ? Math.round(((maxPrice - minPrice) / minPrice) * 10000) / 100
            : 0,
        };
      })
      // Ordenar por precio promedio (menor primero)
      .sort((a, b) => a.avgPrice - b.avgPrice);

    // Identificar la mejor opción (menor precio promedio)
    const bestOption = comparison.length > 0
      ? {
          storeId: comparison[0].store.id,
          storeName: comparison[0].store.name,
          avgPrice: comparison[0].avgPrice,
          lastPrice: comparison[0].lastPrice,
          savings: comparison.length > 1
            ? Math.round((comparison[comparison.length - 1].avgPrice - comparison[0].avgPrice) * 100) / 100
            : 0,
          savingsPercentage: comparison.length > 1
            ? Math.round(((comparison[comparison.length - 1].avgPrice - comparison[0].avgPrice) / comparison[comparison.length - 1].avgPrice) * 10000) / 100
            : 0,
        }
      : null;

    // Calcular estadísticas globales del producto
    const allPrices = purchaseItems.map((item) => parseFloat(item.unitPrice.toString()));
    const globalStats = {
      minPrice: Math.round(Math.min(...allPrices) * 100) / 100,
      maxPrice: Math.round(Math.max(...allPrices) * 100) / 100,
      avgPrice: Math.round((allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length) * 100) / 100,
      totalPurchases: purchaseItems.length,
      storesCount: comparison.length,
    };

    return successResponse(res, {
      product,
      comparison,
      bestOption,
      globalStats,
    });
  } catch (error) {
    next(error);
  }
};