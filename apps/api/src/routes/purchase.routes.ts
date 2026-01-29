// src/routes/purchase.routes.ts

import { Router } from "express";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  scanTicket, // <--- 1. Importamos el nuevo controlador
} from "../controllers/purchase.controller";
import { checkJwt } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { validateQuery } from "../middlewares/validate-query.middleware";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  purchaseQuerySchema,
  scanTicketSchema, // <--- 2. Importamos el nuevo esquema
} from "../schemas/purchase.schema";

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * POST /api/v1/{env}/purchases/scan
 * @summary Escanear un ticket usando IA (GPT-4o Vision)
 * @tags Purchases
 * @security BearerAuth
 * @param {ScanTicketRequest} request.body.required - Imagen en Base64
 */
router.post("/scan", validateSchema(scanTicketSchema), scanTicket);

/**
 * GET /api/v1/{env}/purchases
 * @summary Listar compras del usuario con filtros
 */
router.get("/", validateQuery(purchaseQuerySchema), getPurchases);

/**
 * GET /api/v1/{env}/purchases/:id
 */
router.get("/:id", getPurchaseById);

/**
 * POST /api/v1/{env}/purchases
 */
router.post("/", validateSchema(createPurchaseSchema), createPurchase);

/**
 * PUT /api/v1/{env}/purchases/:id
 */
router.put("/:id", validateSchema(updatePurchaseSchema), updatePurchase);

/**
 * DELETE /api/v1/{env}/purchases/:id
 */
router.delete("/:id", deletePurchase);

export default router;

/**
 * DEFINICIONES ADICIONALES PARA SWAGGER
 */

/**
 * @typedef {object} ScanTicketRequest
 * @property {string} image.required - String de la imagen en formato Base64
 */

/**
 * @typedef {object} ExtractedItem
 * @property {string} productName - Nombre identificado por la IA
 * @property {number} quantity - Cantidad detectada
 * @property {number} unitPrice - Precio unitario detectado
 * @property {number} discountPercentage - Descuento detectado
 */

/**
 * @typedef {object} ScanResponseData
 * @property {string} storeName - Nombre de la tienda detectada
 * @property {string} date - Fecha en formato ISO
 * @property {array<ExtractedItem>} items - Lista de productos detectados
 * @property {number} total - Total del ticket
 */