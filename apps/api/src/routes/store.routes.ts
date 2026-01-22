// src/routes/store.routes.ts

import { Router } from "express";
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from "../controllers/store.controller";
import { checkJwt } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { validateQuery } from "../middlewares/validate-query.middleware";
import {
  createStoreSchema,
  updateStoreSchema,
  storeQuerySchema,
} from "../schemas/store.schema";

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * GET /api/v1/{env}/stores
 * @summary Listar tiendas del usuario
 * @tags Stores
 * @security BearerAuth
 * @param {integer} page.query - Número de página - default: 1
 * @param {integer} limit.query - Tiendas por página - default: 10
 * @param {string} search.query - Buscar por nombre o ubicación
 * @return {StoreListResponse} 200 - Lista de tiendas
 * @return {ErrorResponse} 401 - No autorizado
 */
router.get("/", validateQuery(storeQuerySchema), getStores);

/**
 * GET /api/v1/{env}/stores/{id}
 * @summary Obtener tienda por ID
 * @tags Stores
 * @security BearerAuth
 * @param {string} id.path.required - ID de la tienda
 * @return {StoreResponse} 200 - Tienda encontrada
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrada
 */
router.get("/:id", getStoreById);

/**
 * POST /api/v1/{env}/stores
 * @summary Crear nueva tienda
 * @tags Stores
 * @security BearerAuth
 * @param {CreateStoreRequest} request.body.required - Datos de la tienda
 * @return {StoreResponse} 201 - Tienda creada
 * @return {ErrorResponse} 400 - Error de validación
 * @return {ErrorResponse} 401 - No autorizado
 * @example request - Ejemplo
 * {
 *   "name": "Éxito Poblado",
 *   "location": "Calle 10 #43-12, Medellín"
 * }
 */
router.post("/", validateSchema(createStoreSchema), createStore);

/**
 * PUT /api/v1/{env}/stores/{id}
 * @summary Actualizar tienda
 * @tags Stores
 * @security BearerAuth
 * @param {string} id.path.required - ID de la tienda
 * @param {UpdateStoreRequest} request.body.required - Datos a actualizar
 * @return {StoreResponse} 200 - Tienda actualizada
 * @return {ErrorResponse} 400 - Error de validación
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrada
 */
router.put("/:id", validateSchema(updateStoreSchema), updateStore);

/**
 * DELETE /api/v1/{env}/stores/{id}
 * @summary Eliminar tienda
 * @tags Stores
 * @security BearerAuth
 * @param {string} id.path.required - ID de la tienda
 * @return {SuccessResponse} 200 - Tienda eliminada
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrada
 * @return {ErrorResponse} 409 - Tiene compras asociadas
 */
router.delete("/:id", deleteStore);

export default router;

/**
 * Tipos para Swagger
 * @typedef {object} CreateStoreRequest
 * @property {string} name.required - Nombre de la tienda (min 2 caracteres)
 * @property {string} location - Ubicación (opcional)
 */

/**
 * @typedef {object} UpdateStoreRequest
 * @property {string} name - Nombre de la tienda
 * @property {string} location - Ubicación
 */

/**
 * @typedef {object} Store
 * @property {string} id - ID de la tienda
 * @property {string} name - Nombre
 * @property {string} location - Ubicación
 * @property {string} createdAt - Fecha de creación
 */

/**
 * @typedef {object} StoreListResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {array<Store>} data.stores - Lista de tiendas
 * @property {Pagination} data.pagination - Información de paginación
 * @property {string} message - Mensaje
 */

/**
 * @typedef {object} StoreResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {Store} data.store - Tienda
 * @property {string} message - Mensaje
 */