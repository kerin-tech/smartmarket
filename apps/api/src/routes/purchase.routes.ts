// src/routes/purchase.routes.ts

import { Router } from "express";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  scanTicket,    // IA Scan
  confirmTicket, // Persistencia en masa <--- Nueva importación
} from "../controllers/purchase.controller";
import { checkJwt } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { validateQuery } from "../middlewares/validate-query.middleware";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  purchaseQuerySchema,
  scanTicketSchema,
  // confirmPurchaseSchema, // Descomentar si creas una validación específica
} from "../schemas/purchase.schema";

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * POST /api/v1/{env}/purchases/scan
 * @summary Escanear un ticket usando IA (GPT-4o Vision)
 * @description Envía la imagen para extraer datos y buscar coincidencias (Matching)
 */
router.post("/scan", validateSchema(scanTicketSchema), scanTicket);

/**
 * POST /api/v1/{env}/purchases/confirm
 * @summary Confirmar y registrar la compra en masa
 * @description Recibe el JSON revisado del scan y persiste todo en la base de datos
 */
router.post("/confirm", confirmTicket); // <--- Endpoint añadido

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
 * @summary Registro manual de compra (uno a uno)
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
 * DEFINICIONES PARA SWAGGER (Actualizadas)
 */

/**
 * @typedef {object} ScanTicketRequest
 * @property {string} image.required - String de la imagen en formato Base64
 */

/**
 * @typedef {object} ProductMatch
 * @property {string} product_id - ID del producto en DB
 * @property {string} name - Nombre del producto en DB
 * @property {number} confidence - Nivel de similitud (0 a 1)
 */

/**
 * @typedef {object} ExtractedItem
 * @property {string} raw_text - Texto original del ticket
 * @property {string} detected_name - Nombre limpio por IA
 * @property {number} detected_price - Precio unitario
 * @property {number} detected_quantity - Cantidad
 * @property {ProductMatch} match - Coincidencia encontrada en BD (o null)
 */

/**
 * @typedef {object} ScanResponseData
 * @property {string} ticket_id - ID temporal de la sesión de escaneo
 * @property {string} detected_date - Fecha detectada
 * @property {string} detected_store - Tienda detectada
 * @property {array<ExtractedItem>} items - Lista de productos con matching
 */