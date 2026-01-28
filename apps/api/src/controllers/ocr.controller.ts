// src/controllers/ocr.controller.ts

import { Request, Response, NextFunction } from 'express';
import { processTicketImage, testConnection } from '../services/ocr.service';
import { successResponse, errorResponse } from '../utils/response.handle';

/**
 * POST /api/v1/ocr/process
 * Procesa una imagen de ticket y extrae los productos
 */
export async function processTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      errorResponse(res, 'No se recibió ninguna imagen', 400);
      return;
    }

    const result = await processTicketImage(file.buffer);

    if (!result.success) {
      errorResponse(res, result.error || 'Error procesando imagen', 422);
      return;
    }

    successResponse(
      res,
      {
        ticket: result.data,
        processingTimeMs: result.processingTimeMs,
      },
      'Ticket procesado exitosamente'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/ocr/health
 * Verifica la conexión con Google Cloud Vision
 */
export async function healthCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isConnected = await testConnection();

    if (!isConnected) {
      errorResponse(res, 'No se pudo conectar con Google Cloud Vision', 503);
      return;
    }

    successResponse(
      res,
      { status: 'ok', service: 'Google Cloud Vision' },
      'Servicio OCR funcionando correctamente'
    );
  } catch (error) {
    next(error);
  }
}