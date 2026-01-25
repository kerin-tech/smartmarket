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
 */
export const getMonthlyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 6, 1), 24);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const purchases = await prisma.purchase.findMany({
      where: { userId, date: { gte: startDate } },
      include: { items: true },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, any> = {};

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { totalSpent: 0, totalBase: 0, totalSavings: 0, totalPurchases: 0, totalItems: 0 };
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
        averagePerPurchase: data.totalPurchases > 0 ? Math.round((data.totalSpent / data.totalPurchases) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return successResponse(res, { 
        monthly: monthlyAnalytics, 
        summary: {
            totalSpent: Math.round(monthlyAnalytics.reduce((sum, m) => sum + m.totalSpent, 0) * 100) / 100,
            totalPurchases: monthlyAnalytics.reduce((sum, m) => sum + m.totalPurchases, 0),
            period: { months, startDate: startDate.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }
        }
    });
  } catch (error) { next(error); }
};

/**
 * GET /api/v1/analytics/summary
 */
export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const monthParam = req.query.month as string | undefined;

    let dateFilter: any;
    let periodLabel: string | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      dateFilter = { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) };
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
      if (spending > topStoreSpending) { topStoreId = id; topStoreSpending = spending; }
    });
    
    interface StoreSummary {
  id: string;
  name: string;
  totalSpent: number;
}

    // ... dentro de getSummary
let topStore: StoreSummary | null = null; 

if (topStoreId) {
  const store = await prisma.store.findUnique({ 
    where: { id: topStoreId }, 
    select: { id: true, name: true } 
  });

  if (store) {
    // Ahora TS sabe que 'store' tiene id y name, y 'topStore' acepta este objeto
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
  } catch (error) { next(error); }
};

/**
 * GET /api/v1/analytics/by-store
 * Devuelve el desglose de gastos por local con detalle de productos y descuentos.
 */
export const getByStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // 1. Captura y limpieza del parámetro de mes
    const rawMonth = (req.query.month || req.query['month']) as string;
    const cleanMonth = rawMonth 
      ? String(rawMonth).replace(/['"]+/g, '').trim() 
      : undefined;

    let dateFilter: any;
    let periodLabel: string;

    const isValidMonth = cleanMonth && /^\d{4}[-]\d{2}$/.test(cleanMonth);

    if (isValidMonth) {
      const [year, month] = cleanMonth!.split('-').map(Number);
      dateFilter = {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(year, month, 1))
      };
      periodLabel = formatMonthLabel(cleanMonth!);
    } else {
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() - 6);
      dateFilter = { gte: fallbackDate };
      periodLabel = "Últimos 6 meses";
    }

    // 2. Consulta a la base de datos incluyendo items y productos
    const purchases = await prisma.purchase.findMany({
      where: { 
        userId, 
        date: dateFilter 
      },
      include: { 
        store: true, 
        items: {
          include: {
            product: true
          }
        } 
      },
      orderBy: {
        date: 'desc'
      }
    });

    // 3. Procesamiento y Agrupación con cálculo de totales corregido
    const storesMap = purchases.reduce((acc, purchase) => {
      if (!purchase.store) return acc;
      
      const storeId = purchase.storeId;
      if (!acc[storeId]) {
        acc[storeId] = { 
          id: storeId, 
          name: purchase.store.name, 
          totalSpent: 0, 
          totalPurchases: 0,
          purchases: [] 
        };
      }

      let currentPurchaseTotal = 0;
      
      // Mapeamos los items de esta compra específica
      const itemsDetail = purchase.items.map(item => {
        const { total, quantity } = calculateItemTotals(item);
        currentPurchaseTotal += total; // Acumulamos para el total de la compra
        
        return {
          id: item.id,
          productName: item.product.name,
          quantity,
          total: Math.round(total * 100) / 100,
          discountPercentage: Number(item.discountPercentage || 0) // <--- Info vital para el resaltado
        };
      });

      // Actualizamos los acumuladores de la TIENDA
      acc[storeId].totalSpent += currentPurchaseTotal;
      acc[storeId].totalPurchases += 1;

      // Agregamos la compra al historial de esta tienda
      acc[storeId].purchases.push({
        id: purchase.id,
        date: purchase.date,
        total: Math.round(currentPurchaseTotal * 100) / 100,
        items: itemsDetail
      });

      return acc;
    }, {} as Record<string, any>);

    // 4. Formateo y ordenamiento final
    const byStore = Object.values(storesMap)
      .map((s: any) => ({
        ...s,
        totalSpent: Math.round(s.totalSpent * 100) / 100
      }))
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent);

    // Calculamos el totalSpent global para los porcentajes del frontend
    const totalSpent = byStore.reduce((sum, s: any) => sum + s.totalSpent, 0);

    return successResponse(res, { 
      byStore, 
      totalSpent: Math.round(totalSpent * 100) / 100,
      period: periodLabel 
    });
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

    let dateFilter: any;
    let periodLabel: string | undefined; // <--- SE DECLARA AQUÍ

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      // Usamos UTC para que coincida con el almacenamiento de la DB
      dateFilter = { 
        gte: new Date(Date.UTC(year, month - 1, 1)), 
        lt: new Date(Date.UTC(year, month, 1)) 
      };
      periodLabel = formatMonthLabel(monthParam);
    } else {
      // Fallback si no hay mes: últimos 6 meses
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      dateFilter = { gte: startDate };
      periodLabel = "Últimos 6 meses";
    }

    // FILTRO CRUCIAL: Accedemos a la fecha a través de la relación 'purchase'
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { 
        purchase: { 
          userId, 
          date: dateFilter 
        } 
      },
      include: { product: true },
    });

    const categoryData: Record<string, any> = {};

    purchaseItems.forEach((item) => {
      // Usamos la categoría del producto o 'Otros' si es null
      const category = item.product.category || 'Otros';
      const { total } = calculateItemTotals(item);

      if (!categoryData[category]) {
        categoryData[category] = { name: category, amount: 0, count: 0 };
      }

      categoryData[category].amount += total;
      categoryData[category].count += 1;
    });

    const grandTotal = Object.values(categoryData).reduce((sum, c: any) => sum + c.amount, 0);

    const byCategory = Object.values(categoryData)
      .map((data: any) => ({
        name: data.name,
        amount: Math.round(data.amount * 100) / 100,
        percentage: grandTotal > 0 ? Math.round((data.amount / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // RESPUESTA: Ahora periodLabel existe y los datos están filtrados
    return successResponse(res, { 
      byCategory, 
      grandTotal: Math.round(grandTotal * 100) / 100, 
      period: periodLabel 
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
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      dateFilter = { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) };
    }

    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { purchase: { userId, ...(dateFilter && { date: dateFilter }) } },
      include: { product: true },
    });

    const productData: Record<string, any> = {};
    purchaseItems.forEach((item) => {
      const productId = item.product.id;
      const { total, quantity } = calculateItemTotals(item);
      if (!productData[productId]) {
        productData[productId] = { product: item.product, totalSpent: 0, totalQuantity: 0, prices: [] };
      }
      productData[productId].totalSpent += total;
      productData[productId].totalQuantity += quantity;
      productData[productId].prices.push(Number(item.unitPrice));
    });

    const grandTotal = Object.values(productData).reduce((sum, p: any) => sum + p.totalSpent, 0);

    const topProducts = Object.values(productData)
      .map((data: any) => ({
        ...data.product,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        totalQuantity: Math.round(data.totalQuantity * 1000) / 1000,
        percentage: grandTotal > 0 ? Math.round((data.totalSpent / grandTotal) * 100) : 0,
        avgPrice: Math.round((data.prices.reduce((s: any, p: any) => s + p, 0) / data.prices.length) * 100) / 100
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    return successResponse(res, { topProducts, grandTotal: Math.round(grandTotal * 100) / 100 });
  } catch (error) { next(error); }
};

/**
 * GET /api/v1/analytics/compare-prices
 * Compara precios entre locales y genera historial detallado con descuentos
 */
export const comparePrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      return errorResponse(res, 'El parámetro productId es requerido', ERROR_CODES.BAD_REQUEST.code);
    }

    const product = await prisma.product.findFirst({ 
      where: { id: productId, userId } 
    });
    
    if (!product) return errorResponse(res, 'Producto no encontrado', ERROR_CODES.NOT_FOUND.code);

    // Obtenemos todos los ítems de compra de este producto
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { productId, purchase: { userId } },
      include: { 
        purchase: { 
          include: { store: true } 
        } 
      },
      orderBy: { purchase: { date: 'desc' } }, 
    });

    const storeStats: Record<string, any> = {};

    // 1. Procesar Datos para Comparación por Local
    purchaseItems.forEach((item) => {
      const storeId = item.purchase.storeId;
      const unitPrice = Number(item.unitPrice);
      const discountPercentage = Number(item.discountPercentage || 0);
      
      // PRECIO REAL PAGADO (Neto)
      const finalPrice = Number((unitPrice * (1 - discountPercentage / 100)).toFixed(2));
      const purchaseDate = new Date(item.purchase.date);

      if (!storeStats[storeId]) {
        storeStats[storeId] = {
          store: item.purchase.store,
          finalPrices: [], // Lista de precios finales pagados
          lastPrice: finalPrice,
          lastDate: purchaseDate,
          minPrice: finalPrice,
          minPriceDate: purchaseDate
        };
      }

      storeStats[storeId].finalPrices.push(finalPrice);

      // Actualizar si es la compra más reciente
      if (purchaseDate > storeStats[storeId].lastDate) {
        storeStats[storeId].lastPrice = finalPrice;
        storeStats[storeId].lastDate = purchaseDate;
      }

      // Actualizar si es el precio más bajo histórico en este local
      if (finalPrice < storeStats[storeId].minPrice) {
        storeStats[storeId].minPrice = finalPrice;
        storeStats[storeId].minPriceDate = purchaseDate;
      }
    });

    // 2. Formatear la Comparativa (La lista de locales)
    const comparison = Object.values(storeStats).map((stat: any) => {
      const lastPrice = stat.lastPrice;
      const previousPrice = stat.finalPrices.length > 1 ? stat.finalPrices[1] : null;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (previousPrice !== null) {
        if (lastPrice < previousPrice) trend = 'down';
        else if (lastPrice > previousPrice) trend = 'up';
      }

      return {
        store: stat.store,
        minPrice: stat.minPrice,
        minPriceDate: stat.minPriceDate.toISOString().split('T')[0],
        maxPrice: Math.max(...stat.finalPrices),
        avgPrice: Math.round((stat.finalPrices.reduce((s: any, p: any) => s + p, 0) / stat.finalPrices.length) * 100) / 100,
        lastPrice: lastPrice,
        lastDate: stat.lastDate.toISOString().split('T')[0],
        purchaseCount: stat.finalPrices.length,
        previousPrice,
        trend 
      };
    }).sort((a, b) => a.minPrice - b.minPrice);

    // 3. Generar el Historial Detallado para el Timeline (De nuevo a viejo)
    const history = purchaseItems.map(item => {
      const uPrice = Number(item.unitPrice);
      const dPercent = Number(item.discountPercentage || 0);
      const fPrice = Number((uPrice * (1 - dPercent / 100)).toFixed(2));

      return {
        id: item.id,
        date: item.purchase.date.toISOString().split('T')[0],
        storeName: item.purchase.store.name,
        originalPrice: uPrice,
        discountPercentage: dPercent,
        finalPrice: fPrice,
        quantity: Number(item.quantity)
      };
    });

    return successResponse(res, { product, comparison, history });
  } catch (error) { 
    next(error); 
  }
};