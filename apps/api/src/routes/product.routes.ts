// src/routes/product.routes.ts

import { Router } from "express";
import {
  getProducts,
  getProductById,
  getAllProducts,  // <- Agregar esta importación
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { checkJwt } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { validateQuery } from "../middlewares/validate-query.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../schemas/product.schema";

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * GET /api/v1/{env}/products/all
 * @summary Obtener todos los productos sin paginación (para selects/modales)
 * @tags Products
 * @security BearerAuth
 * @param {string} search.query - Buscar por nombre o marca (opcional)
 * @return {ProductAllResponse} 200 - Lista completa de productos
 * @return {ErrorResponse} 401 - No autorizado
 */
router.get("/all", getAllProducts);  // <- DEBE IR ANTES DE /:id

/**
 * GET /api/v1/{env}/products
 * @summary Listar productos del usuario con paginación
 * @tags Products
 * @security BearerAuth
 * @param {integer} page.query - Número de página - default: 1
 * @param {integer} limit.query - Productos por página - default: 10
 * @param {string} search.query - Buscar por nombre o marca
 * @param {string} category.query - Filtrar por categoría
 * @return {ProductListResponse} 200 - Lista de productos
 * @return {ErrorResponse} 401 - No autorizado
 */
router.get("/", validateQuery(productQuerySchema), getProducts);

/**
 * GET /api/v1/{env}/products/{id}
 * @summary Obtener producto por ID
 * @tags Products
 * @security BearerAuth
 * @param {string} id.path.required - ID del producto
 * @return {ProductResponse} 200 - Producto encontrado
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrado
 */
router.get("/:id", getProductById);

/**
 * POST /api/v1/{env}/products
 * @summary Crear nuevo producto
 * @tags Products
 * @security BearerAuth
 * @param {CreateProductRequest} request.body.required - Datos del producto
 * @return {ProductResponse} 201 - Producto creado
 * @return {ErrorResponse} 400 - Error de validación
 * @return {ErrorResponse} 401 - No autorizado
 */
router.post("/", validateSchema(createProductSchema), createProduct);

/**
 * PUT /api/v1/{env}/products/{id}
 * @summary Actualizar producto
 * @tags Products
 * @security BearerAuth
 * @param {string} id.path.required - ID del producto
 * @param {UpdateProductRequest} request.body.required - Datos a actualizar
 * @return {ProductResponse} 200 - Producto actualizado
 * @return {ErrorResponse} 400 - Error de validación
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrado
 */
router.put("/:id", validateSchema(updateProductSchema), updateProduct);

/**
 * DELETE /api/v1/{env}/products/{id}
 * @summary Eliminar producto
 * @tags Products
 * @security BearerAuth
 * @param {string} id.path.required - ID del producto
 * @return {SuccessResponse} 200 - Producto eliminado
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 403 - Sin permiso
 * @return {ErrorResponse} 404 - No encontrado
 * @return {ErrorResponse} 409 - Tiene compras asociadas
 */
router.delete("/:id", deleteProduct);

export default router;

/**
 * @typedef {object} ProductAllResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {array<Product>} data.products - Lista completa de productos
 * @property {integer} data.total - Total de productos
 * @property {string} message - Mensaje
 */