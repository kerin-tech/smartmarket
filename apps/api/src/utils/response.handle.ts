import { Response } from "express";

interface SuccessResponseData {
  success: true;
  data: unknown;
  message: string;
}

interface ErrorResponseData {
  success: false;
  message: string;
  code: number;
  errors?: unknown;
}

/**
 * Respuesta exitosa estandarizada
 */
export const successResponse = (
  res: Response,
  data: unknown,
  message: string = "Operación exitosa",
  statusCode: number = 200
): Response<SuccessResponseData> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Respuesta de error estandarizada
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: unknown
): Response<ErrorResponseData> => {
  const response: ErrorResponseData = {
    success: false,
    message,
    code: statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};