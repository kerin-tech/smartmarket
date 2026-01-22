import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";

export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar y transformar el body (trim, lowercase, etc.)
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return errorResponse(
          res,
          "Error de validación",
          ERROR_CODES.BAD_REQUEST.code,
          errorMessages
        );
      }
      next(error);
    }
  };
};