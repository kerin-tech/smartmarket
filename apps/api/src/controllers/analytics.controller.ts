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
 */

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const [purchaseStats, storeCount, productCount] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId },
        include: { items: true },
      }),
      prisma.store.count({
        where: { userId },
      }),
      prisma.product.count({
        where: { userId },
      }),
    ]);

    let totalSpent = 0;
    let totalItems = 0;
    const storeSpending: Record<string, number> = {};

    purchaseStats.forEach((purchase) => {
      const purchaseTotal = purchase.items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0
      );
      totalSpent += purchaseTotal;
      totalItems += purchase.items.length;
      storeSpending[purchase.storeId] = (storeSpending[purchase.storeId] || 0) + purchaseTotal;
    });

    let topStoreId: string | null = null;
    let topStoreSpending = 0;
    Object.entries(storeSpending).forEach(([storeId, spending]) => {
      if (spending > topStoreSpending) {
        topStoreId = storeId;
        topStoreSpending = spending;
      }
    });

    // CORRECCIÓN DE TIPO (El error TS2322 que vimos antes)
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
    });
  } catch (error) { // Asegúrate de que estas líneas existan
    next(error);
  } // <--- ESTA LLAVE ES LA QUE PROBABLEMENTE FALTABA
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