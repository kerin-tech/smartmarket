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
} from "../controllers/analytics.controller";

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * GET /api/v1/analytics/monthly
 * @summary Obtener métricas mensuales de compras
 * @tags Analytics
 * @security BearerAuth
 * @param {number} months.query - Número de meses (default: 6, max: 24)
 */
router.get("/monthly", validateQuery(monthsQuerySchema), getMonthlyAnalytics);

/**
 * GET /api/v1/analytics/summary
 * @summary Obtener resumen general de todas las compras (Total, Ahorros, etc)
 * @tags Analytics
 * @security BearerAuth
 */
router.get("/summary", getSummary);

/**
 * GET /api/v1/analytics/by-store
 * @summary Obtener gastos agrupados por tienda
 * @tags Analytics
 * @security BearerAuth
 * @param {number} months.query - Número de meses
 */
router.get("/by-store", validateQuery(monthsQuerySchema), getByStore);

/**
 * GET /api/v1/analytics/by-category
 * @summary Obtener gastos agrupados por categoría
 * @tags Analytics
 * @security BearerAuth
 * @param {number} months.query - Número de meses
 */
router.get("/by-category", validateQuery(monthsQuerySchema), getByCategory);

/**
 * GET /api/v1/analytics/compare-prices
 * @summary Comparar precios de un producto en diferentes tiendas
 * @tags Analytics
 * @security BearerAuth
 * @param {string} productId.query.required - UUID del producto
 */
router.get("/compare-prices", comparePrices);

export default router;