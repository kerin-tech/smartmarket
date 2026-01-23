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
 * @access  Private
 */
router.get("/summary", getSummary);

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

export default router;