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
 * @summary Listar compras del usuario
 * @tags Purchases
 * @security BearerAuth
 * @param {integer} page.query - Número de página - default: 1
 * @param {integer} limit.query - Compras por página - default: 10
 * @param {string} month.query - Filtrar por mes (YYYY-MM)
 * @param {string} productId.query - Filtrar por producto
 * @param {string} storeId.query - Filtrar por tienda
 * @param {string} dateFrom.query - Fecha desde (YYYY-MM-DD)
 * @param {string} dateTo.query - Fecha hasta (YYYY-MM-DD)
 * @return {PurchaseListResponse} 200 - Lista de compras
 * @return {ErrorResponse} 401 - No autorizado
 */
router.get("/", validateQuery(purchaseQuerySchema), getPurchases);

/**
 * GET /api/v1/{env}/purchases/{id}
 * @summary Obtener compra por ID
 * @tags Purchases
 * @security BearerAuth
 * @param {string} id.path.required - ID de la compra
 * @return {PurchaseResponse} 200 - Compra encontrada
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrada
 */
router.get("/:id", getPurchaseById);

/**
 * POST /api/v1/{env}/purchases
 * @summary Registrar nueva compra
 * @tags Purchases
 * @security BearerAuth
 * @param {CreatePurchaseRequest} request.body.required - Datos de la compra
 * @return {PurchaseResponse} 201 - Compra registrada
 * @return {ErrorResponse} 400 - Error de validación
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Producto o tienda no pertenece al usuario
 * @return {ErrorResponse} 404 - Producto o tienda no encontrada
 * @example request - Ejemplo
 * {
 *   "productId": "uuid-producto",
 *   "storeId": "uuid-tienda",
 *   "price": 5500,
 *   "quantity": 2,
 *   "date": "2025-01-22"
 * }
 */
router.post("/", validateSchema(createPurchaseSchema), createPurchase);

/**
 * PUT /api/v1/{env}/purchases/{id}
 * @summary Actualizar compra
 * @tags Purchases
 * @security BearerAuth
 * @param {string} id.path.required - ID de la compra
 * @param {UpdatePurchaseRequest} request.body.required - Datos a actualizar
 * @return {PurchaseResponse} 200 - Compra actualizada
 * @return {ErrorResponse} 400 - Error de validación
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrada
 */
router.put("/:id", validateSchema(updatePurchaseSchema), updatePurchase);

/**
 * DELETE /api/v1/{env}/purchases/{id}
 * @summary Eliminar compra
 * @tags Purchases
 * @security BearerAuth
 * @param {string} id.path.required - ID de la compra
 * @return {SuccessResponse} 200 - Compra eliminada
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrada
 */
router.delete("/:id", deletePurchase);

export default router;

/**
 * Tipos para Swagger
 * @typedef {object} CreatePurchaseRequest
 * @property {string} productId.required - ID del producto
 * @property {string} storeId.required - ID de la tienda
 * @property {number} price.required - Precio (mayor a 0)
 * @property {number} quantity.required - Cantidad (mayor a 0)
 * @property {string} date.required - Fecha de compra (YYYY-MM-DD)
 */

/**
 * @typedef {object} UpdatePurchaseRequest
 * @property {string} productId - ID del producto
 * @property {string} storeId - ID de la tienda
 * @property {number} price - Precio
 * @property {number} quantity - Cantidad
 * @property {string} date - Fecha de compra
 */

/**
 * @typedef {object} PurchaseProduct
 * @property {string} id - ID del producto
 * @property {string} name - Nombre
 * @property {string} category - Categoría
 * @property {string} brand - Marca
 */

/**
 * @typedef {object} PurchaseStore
 * @property {string} id - ID de la tienda
 * @property {string} name - Nombre
 * @property {string} location - Ubicación
 */

/**
 * @typedef {object} Purchase
 * @property {string} id - ID de la compra
 * @property {number} price - Precio unitario
 * @property {number} quantity - Cantidad
 * @property {number} total - Total (price * quantity)
 * @property {string} date - Fecha de compra
 * @property {string} createdAt - Fecha de registro
 * @property {PurchaseProduct} product - Producto
 * @property {PurchaseStore} store - Tienda
 */

/**
 * @typedef {object} PurchaseListResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {array<Purchase>} data.purchases - Lista de compras
 * @property {Pagination} data.pagination - Información de paginación
 * @property {string} message - Mensaje
 */

/**
 * @typedef {object} PurchaseResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {Purchase} data.purchase - Compra
 * @property {string} message - Mensaje
 */