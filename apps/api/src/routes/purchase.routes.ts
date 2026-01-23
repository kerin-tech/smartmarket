// src/routes/purchase.routes.ts

import { Router } from "express";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchase.controller";
import { checkJwt } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { validateQuery } from "../middlewares/validate-query.middleware";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
  purchaseQuerySchema,
} from "../schemas/purchase.schema";

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * GET /api/v1/{env}/purchases
 * @summary Listar compras del usuario con filtros
 * @tags Purchases
 * @security BearerAuth
 */
router.get("/", validateQuery(purchaseQuerySchema), getPurchases);

/**
 * GET /api/v1/{env}/purchases/{id}
 * @summary Obtener el detalle de una compra específica
 * @tags Purchases
 * @security BearerAuth
 */
router.get("/:id", getPurchaseById);

/**
 * POST /api/v1/{env}/purchases
 * @summary Registrar una nueva compra con múltiples productos y descuentos
 * @tags Purchases
 * @security BearerAuth
 * @param {CreatePurchaseRequest} request.body.required - Datos de la compra
 */
router.post("/", validateSchema(createPurchaseSchema), createPurchase);

/**
 * PUT /api/v1/{env}/purchases/{id}
 * @summary Actualizar los datos o ítems de una compra existente
 * @tags Purchases
 * @security BearerAuth
 * @param {UpdatePurchaseRequest} request.body.required - Datos a actualizar
 */
router.put("/:id", validateSchema(updatePurchaseSchema), updatePurchase);

/**
 * DELETE /api/v1/{env}/purchases/{id}
 * @summary Eliminar una compra del registro
 * @tags Purchases
 * @security BearerAuth
 */
router.delete("/:id", deletePurchase);

export default router;

/**
 * DEFINICIONES PARA SWAGGER (Actualizadas a la nueva estructura)
 */

/**
 * @typedef {object} PurchaseItemRequest
 * @property {string} productId.required - ID del producto (UUID)
 * @property {number} quantity.required - Cantidad (mayor a 0)
 * @property {number} unitPrice.required - Precio unitario (mayor a 0)
 * @property {number} discountPercentage - Porcentaje de descuento (0-100)
 */

/**
 * @typedef {object} CreatePurchaseRequest
 * @property {string} storeId.required - ID de la tienda (UUID)
 * @property {string} date.required - Fecha (YYYY-MM-DD)
 * @property {array<PurchaseItemRequest>} items.required - Lista de productos comprados
 */

/**
 * @typedef {object} UpdatePurchaseRequest
 * @property {string} storeId - ID de la tienda
 * @property {string} date - Fecha
 * @property {array<PurchaseItemRequest>} items - Nueva lista de productos
 */

/**
 * @typedef {object} PurchaseItemResponse
 * @property {string} id - ID del registro del ítem
 * @property {string} productId - ID del producto
 * @property {number} quantity - Cantidad
 * @property {number} unitPrice - Precio por unidad
 * @property {number} discountPercentage - Descuento aplicado
 * @property {number} subtotal - Total del ítem tras descuento
 * @property {object} product - Datos básicos del producto (nombre, marca, etc)
 */

/**
 * @typedef {object} PurchaseResponseData
 * @property {string} id - ID de la compra
 * @property {string} date - Fecha de compra
 * @property {number} total - Total de la compra (suma de subtotales)
 * @property {number} itemCount - Cantidad de productos diferentes
 * @property {object} store - Datos de la tienda
 * @property {array<PurchaseItemResponse>} items - Detalle de los productos
 */

/**
 * @typedef {object} PurchaseResponse
 * @property {boolean} success - Estado de la operación
 * @property {PurchaseResponseData} data - Información de la compra
 * @property {string} message - Mensaje de confirmación
 */