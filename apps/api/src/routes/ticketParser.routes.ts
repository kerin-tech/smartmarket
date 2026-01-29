// src/routes/ticketParser.routes.ts

import { Router } from 'express';
import {
  detectStoreController,
  parseTicketController,
  getSupportedStoresController,
  healthController,
} from '../controllers/ticketParser.controller';

const router = Router();

/**
 * @route   GET /api/v1/ticket-parser/health
 * @desc    Estado del servicio
 * @access  Public
 */
router.get('/health', healthController);

/**
 * @route   GET /api/v1/ticket-parser/stores
 * @desc    Lista tiendas soportadas
 * @access  Public
 */
router.get('/stores', getSupportedStoresController);

/**
 * @route   POST /api/v1/ticket-parser/detect
 * @desc    Detecta la tienda del texto OCR
 * @access  Public
 * @body    { ocrText: string }
 */
router.post('/detect', detectStoreController);

/**
 * @route   POST /api/v1/ticket-parser/parse
 * @desc    Parsea un ticket completo
 * @access  Public
 * @body    { ocrText: string, storeKey?: string }
 */
router.post('/parse', parseTicketController);

export default router;