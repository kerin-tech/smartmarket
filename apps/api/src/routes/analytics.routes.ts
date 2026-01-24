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
 * GET /api/v1/analytics/monthly
 * @summary Obtener métricas mensuales de compras
 * @tags Analytics
 * @security BearerAuth
 * @param {number} months.query - Número de meses a recuperar (default: 6, max: 24)
 * @return {AnalyticsResponse} 200 - Métricas obtenidas con éxito
 * @return {ErrorResponse} 401 - No autorizado
 */
router.get("/monthly", validateQuery(monthsQuerySchema), getMonthlyAnalytics);

/**
 * GET /api/v1/analytics/summary
 * @summary Obtener resumen general de gastos
 * @tags Analytics
 * @security BearerAuth
 * @param {string} month.query - Filtrar por mes específico (formato YYYY-MM)
 * @return {AnalyticsResponse} 200 - Resumen obtenido con éxito
 */
router.get("/summary", getSummary);

/**
 * GET /api/v1/analytics/top-products
 * @summary Obtener productos más comprados
 * @tags Analytics
 * @security BearerAuth
 * @param {number} limit.query - Cantidad de productos (default: 5)
 * @param {string} month.query - Filtrar por mes específico (YYYY-MM)
 * @return {AnalyticsResponse} 200 - Lista de productos obtenida
 */
router.get("/top-products", getTopProducts);

/**
 * GET /api/v1/analytics/by-store
 * @summary Obtener gastos agrupados por tienda
 * @tags Analytics
 * @security BearerAuth
 * @param {string} month.query - Filtrar por mes específico (YYYY-MM)
 * @param {number} months.query - Cantidad de meses (si no se envía month)
 * @return {AnalyticsResponse} 200 - Gastos por tienda obtenidos
 */
router.get("/by-store", getByStore);

/**
 * GET /api/v1/analytics/by-category
 * @summary Obtener gastos agrupados por categoría
 * @tags Analytics
 * @security BearerAuth
 * @param {string} month.query - Filtrar por mes específico (YYYY-MM)
 * @param {number} months.query - Cantidad de meses (si no se envía month)
 * @return {AnalyticsResponse} 200 - Gastos por categoría obtenidos
 */
router.get("/by-category", getByCategory);

/**
 * GET /api/v1/analytics/compare-prices
 * @summary Comparar precios de un producto entre tiendas
 * @tags Analytics
 * @security BearerAuth
 * @param {string} productId.query.required - UUID del producto
 * @return {AnalyticsResponse} 200 - Comparativa de precios obtenida
 */
router.get("/compare-prices", comparePrices);

export default router;

/**
 * Definición de tipos para Swagger
 * @typedef {object} AnalyticsResponse
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {object} data - Datos de la analítica
 * @property {string} message - Mensaje de confirmación
 */

/**
 * @typedef {object} ErrorResponse
 * @property {boolean} success - false
 * @property {string} message - Mensaje de error
 * @property {number} code - Código de error HTTP
 */