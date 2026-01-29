// src/controllers/ticketParser.controller.ts

import { Request, Response } from 'express';
import { 
  parseTicket, 
  detectStore, 
  getSupportedStores,
  parserRegistry 
} from '../parsers';

/**
 * POST /api/v1/ticket-parser/detect
 * Detecta la tienda a partir del texto OCR
 */
export async function detectStoreController(req: Request, res: Response) {
  try {
    const { ocrText } = req.body;

    if (!ocrText || typeof ocrText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ocrText es requerido',
      });
    }

    const result = detectStore(ocrText);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * POST /api/v1/ticket-parser/parse
 * Parsea un ticket completo
 */
export async function parseTicketController(req: Request, res: Response) {
  try {
    const { ocrText, storeKey } = req.body;

    if (!ocrText || typeof ocrText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ocrText es requerido',
      });
    }

    const result = parseTicket(ocrText, storeKey);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/v1/ticket-parser/stores
 * Lista tiendas soportadas
 */
export async function getSupportedStoresController(req: Request, res: Response) {
  try {
    const stores = getSupportedStores();

    return res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/v1/ticket-parser/health
 * Estado del servicio de parsing
 */
export async function healthController(req: Request, res: Response) {
  return res.json({
    success: true,
    data: {
      status: 'ok',
      parsersLoaded: parserRegistry.count(),
      stores: getSupportedStores().map(s => s.key),
    },
  });
}