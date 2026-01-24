import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";

/**
 * GET /users/me
 * Obtener perfil del usuario autenticado
 */
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id; // Extraído de checkJwt

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(
        res,
        "Usuario no encontrado",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    return successResponse(res, user, "Perfil obtenido exitosamente");
  } catch (error) {
    next(error);
  }
};