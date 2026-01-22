import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response.handle";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error Log]: ${err.message}`);

  // Si es un error de validación de Zod
  if (err.name === "ZodError") {
    return errorResponse(res, "Validation Error", 400, err.errors);
  }

  // Si es un error de Prisma (P2002 es clave única duplicada, por ejemplo)
  if (err.code?.startsWith("P")) {
    return errorResponse(res, "Database Consistency Error", 409, err.message);
  }

  // Error genérico
  return errorResponse(res, err.message || "Internal Server Error", err.status || 500);
};