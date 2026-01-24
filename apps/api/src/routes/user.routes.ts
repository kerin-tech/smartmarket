import { Router } from "express";
import { checkJwt } from "../middlewares/auth.middleware";
import { getMyProfile } from "../controllers/user.controller";

const router: Router = Router();

// Todas las rutas de usuario requieren autenticación
router.use(checkJwt);

/**
 * GET /api/v1/{env}/users/me
 * @summary Obtener información del perfil del usuario autenticado
 * @tags Users
 * @security BearerAuth
 * @param {string} env.path.required - Entorno de la ejecución (ej: development, staging, production)
 * @return {successResponse} 200 - Perfil obtenido con éxito
 * @return {ErrorResponse} 401 - No autorizado
 * @return {ErrorResponse} 404 - Usuario no encontrado
 */
router.get("/me", getMyProfile);

export default router;