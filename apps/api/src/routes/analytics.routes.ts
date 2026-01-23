// src/routes/analytics.routes.ts

import { Router } from "express";
import { checkJwt } from "../middlewares/auth.middleware";
import { validateQuery } from "../middlewares/validate-query.middleware";
import { monthsQuerySchema } from "../schemas/analytics.schema";
import {
  getMonthlyAnalytics,
  getSummary,
  getByStore,
  getByCategory,
  comparePrices,
  getTopProducts,
} from "../controllers/analytics.controller";

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * @route   GET /api/v1/analytics/monthly
 * @desc    Obtener métricas mensuales de compras
 * @query   months - Número de meses (default: 6, max: 24)
 * @access  Private
 */
router.get("/monthly", validateQuery(monthsQuerySchema), getMonthlyAnalytics);

/**
 * @route   GET /api/v1/analytics/summary
 * @desc    Obtener resumen general de todas las compras
 * @query   month - Filtrar por mes específico (formato YYYY-MM, opcional)
 * @access  Private
 */
router.get("/summary", getSummary);

/**
 * @route   GET /api/v1/analytics/top-products
 * @desc    Obtener productos más comprados ordenados por gasto total
 * @query   limit - Número de productos (default: 5, max: 20)
 * @query   month - Filtrar por mes específico (formato YYYY-MM, opcional)
 * @access  Private
 */
router.get("/top-products", getTopProducts);

/**
 * @route   GET /api/v1/analytics/by-store
 * @desc    Obtener gastos agrupados por tienda
 * @query   months - Número de meses (default: 6, max: 24)
 * @access  Private
 */
router.get("/by-store", validateQuery(monthsQuerySchema), getByStore);

/**
 * @route   GET /api/v1/analytics/by-category
 * @desc    Obtener gastos agrupados por categoría
 * @query   months - Número de meses (default: 6, max: 24)
 * @access  Private
 */
router.get("/by-category", validateQuery(monthsQuerySchema), getByCategory);

/**
 * @route   GET /api/v1/analytics/compare-prices
 * @desc    Comparar precios de un producto en diferentes tiendas
 * @query   productId - UUID del producto (requerido)
 * @access  Private
 */
router.get("/compare-prices", comparePrices);

export default router;