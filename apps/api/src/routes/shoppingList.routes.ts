// src/routes/shoppingList.routes.ts

import { Router } from "express";
import * as shoppingListController from "../controllers/shoppingList.controller";
import { checkJwt } from "../middlewares/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(checkJwt);

/**
 * POST /api/v1/{env}/shopping-lists
 * @summary Crear una nueva lista de compras
 * @description Crea una lista con productos seleccionados del historial
 */
router.post("/", shoppingListController.create);

/**
 * GET /api/v1/{env}/shopping-lists
 * @summary Obtener todas las listas del usuario
 * @description Retorna todas las listas de compras con sus items
 */
router.get("/", shoppingListController.getAll);

/**
 * GET /api/v1/{env}/shopping-lists/:id/optimized
 * @summary Obtener lista optimizada por tienda y categoría
 * @description Agrupa productos por mejor precio histórico en cada tienda, organizados por categoría
 */
router.get("/:id/optimized", shoppingListController.getOptimized);

/**
 * DELETE /api/v1/{env}/shopping-lists/:id
 * @summary Eliminar una lista de compras
 */
router.delete("/:id", shoppingListController.remove);

/**
 * POST /api/v1/{env}/shopping-lists/:id/duplicate
 * @summary Duplicar una lista existente
 * @description Crea una copia de la lista con todos los checks reseteados
 */
router.post("/:id/duplicate", shoppingListController.duplicate);

/**
 * POST /api/v1/{env}/shopping-lists/:id/reset
 * @summary Resetear checks de una lista
 * @description Desmarca todos los items para reutilizar la lista
 */
router.post("/:id/reset", shoppingListController.resetChecks);

/**
 * POST /api/v1/{env}/shopping-lists/:id/products
 * @summary Agregar productos a una lista existente
 * @description Añade nuevos productos a la lista (ignora duplicados)
 */
router.post("/:id/products", shoppingListController.addProducts);

/**
 * PATCH /api/v1/{env}/shopping-lists/items/:itemId/toggle
 * @summary Marcar/desmarcar un item de la lista
 * @description Toggle del estado checked de un producto
 */
router.patch("/items/:itemId/toggle", shoppingListController.toggleItem);

export default router;

/**
 * DEFINICIONES PARA SWAGGER
 */

/**
 * @typedef {object} CreateShoppingListRequest
 * @property {string} name.required - Nombre de la lista
 * @property {string} frequency - Frecuencia: 'weekly', 'biweekly', 'monthly' o null
 * @property {array<string>} productIds.required - IDs de productos a incluir
 */

/**
 * @typedef {object} DuplicateListRequest
 * @property {string} name - Nuevo nombre para la copia (opcional)
 */

/**
 * @typedef {object} ShoppingListItem
 * @property {string} id - ID del item
 * @property {string} productId - ID del producto
 * @property {boolean} checked - Estado de comprado
 * @property {Product} product - Datos del producto
 */

/**
 * @typedef {object} ShoppingList
 * @property {string} id - ID de la lista
 * @property {string} name - Nombre de la lista
 * @property {string} frequency - Frecuencia de uso
 * @property {string} createdAt - Fecha de creación
 * @property {array<ShoppingListItem>} items - Productos en la lista
 */

/**
 * @typedef {object} OptimizedProduct
 * @property {string} itemId - ID del item en la lista
 * @property {string} productId - ID del producto
 * @property {string} productName - Nombre del producto
 * @property {string} brand - Marca
 * @property {boolean} checked - Estado de comprado
 * @property {number} bestPrice - Mejor precio histórico
 * @property {string} lastPurchaseDate - Última fecha de compra
 */

/**
 * @typedef {object} Category
 * @property {string} name - Nombre de la categoría
 * @property {array<OptimizedProduct>} products - Productos en esta categoría
 */

/**
 * @typedef {object} StoreGroup
 * @property {string} storeId - ID de la tienda
 * @property {string} storeName - Nombre de la tienda
 * @property {array<Category>} categories - Categorías con productos
 * @property {number} total - Total estimado en esta tienda
 */

/**
 * @typedef {object} OptimizedShoppingList
 * @property {string} id - ID de la lista
 * @property {string} name - Nombre de la lista
 * @property {string} frequency - Frecuencia
 * @property {array<StoreGroup>} stores - Tiendas con productos agrupados
 * @property {number} grandTotal - Total estimado de toda la lista
 */