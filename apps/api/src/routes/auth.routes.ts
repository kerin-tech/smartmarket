import { Router } from "express";
import { registerController } from "../controllers/auth.controller";
import { validateSchema } from "../middlewares/validate.middleware";
import { registerSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post("/register", validateSchema(registerSchema), registerController);

export default router;