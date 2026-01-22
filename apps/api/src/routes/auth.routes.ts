import { Router } from "express";
import { registerController, loginController } from "../controllers/auth.controller";
import { validateSchema } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * POST /api/v1/{env}/auth/register
 * @summary Registrar nuevo usuario
 * @tags Auth
 * @param {RegisterRequest} request.body.required - Datos de registro
 * @return {RegisterResponse} 201 - Usuario registrado exitosamente
 * @return {ErrorResponse} 400 - Error de validación o email duplicado
 * @example request - Ejemplo de registro
 * {
 *   "name": "Juan Pérez",
 *   "email": "juan@ejemplo.com",
 *   "password": "12345678"
 * }
 */
router.post("/register", validateSchema(registerSchema), registerController);

/**
 * POST /api/v1/{env}/auth/login
 * @summary Iniciar sesión
 * @tags Auth
 * @param {LoginRequest} request.body.required - Credenciales de acceso
 * @return {LoginResponse} 200 - Inicio de sesión exitoso
 * @return {ErrorResponse} 400 - Credenciales inválidas
 * @example request - Ejemplo de login
 * {
 *   "email": "juan@ejemplo.com",
 *   "password": "12345678"
 * }
 */
router.post("/login", validateSchema(loginSchema), loginController);

export default router;

/**
 * Definición de tipos para Swagger
 * @typedef {object} RegisterRequest
 * @property {string} name.required - Nombre del usuario - min 2 caracteres
 * @property {string} email.required - Correo electrónico
 * @property {string} password.required - Contraseña - min 8 caracteres
 */

/**
 * @typedef {object} LoginRequest
 * @property {string} email.required - Correo electrónico
 * @property {string} password.required - Contraseña
 */

/**
 * @typedef {object} UserResponse
 * @property {string} id - ID del usuario
 * @property {string} name - Nombre
 * @property {string} email - Correo electrónico
 * @property {string} created_at - Fecha de creación
 */

/**
 * @typedef {object} RegisterResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {UserResponse} data.user - Datos del usuario
 * @property {string} data.token - JWT token
 * @property {string} message - Usuario registrado exitosamente
 */

/**
 * @typedef {object} LoginResponse
 * @property {boolean} success - true
 * @property {object} data
 * @property {UserResponse} data.user - Datos del usuario
 * @property {string} data.token - JWT token
 * @property {string} message - Inicio de sesión exitoso
 */

/**
 * @typedef {object} ErrorResponse
 * @property {boolean} success - false
 * @property {string} message - Mensaje de error
 * @property {number} code - Código HTTP
 */