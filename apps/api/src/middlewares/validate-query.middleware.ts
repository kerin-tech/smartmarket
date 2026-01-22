// src/middlewares/validate-query.middleware.ts

import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return errorResponse(
          res,
          "Error en parámetros de consulta",
          ERROR_CODES.BAD_REQUEST.code,
          errorMessages
        );
      }
      next(error);
    }
  };
};