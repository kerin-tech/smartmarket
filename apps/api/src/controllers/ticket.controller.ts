// src/controllers/ticket.controller.ts

import { Request, Response, NextFunction } from 'express';
import { testConnection as testOcrConnection } from '../services/ocr.service';
import { testConnection as testCloudinaryConnection } from '../services/cloudinary.service';
import { 
  processTicket, 
  getTicketById, 
  getUserTickets, 
  deleteTicket,
  confirmTicket,
  ConfirmTicketData
} from '../services/ticket.service';
import { successResponse, errorResponse } from '../utils/response.handle';

/**
 * POST /api/v1/tickets/upload
 * Sube y procesa una imagen de ticket
 */
export async function uploadTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    if (!file) {
      errorResponse(res, 'No se recibió ninguna imagen', 400);
      return;
    }

    const result = await processTicket(userId, file.buffer);

    if (!result.success) {
      errorResponse(res, result.error || 'Error procesando ticket', 422);
      return;
    }

    successResponse(res, result.data, 'Ticket procesado exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/tickets/:id
 * Obtiene un ticket por ID
 */
export async function getTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const ticket = await getTicketById(id, userId);

    if (!ticket) {
      errorResponse(res, 'Ticket no encontrado', 404);
      return;
    }

    successResponse(res, ticket, 'Ticket obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/tickets
 * Lista tickets del usuario
 */
export async function listTickets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const result = await getUserTickets(userId, page, limit);

    successResponse(res, {
      tickets: result.tickets,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    }, 'Tickets obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/tickets/:id
 * Elimina un ticket no confirmado
 */
export async function removeTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const deleted = await deleteTicket(id, userId);

    if (!deleted) {
      errorResponse(res, 'Ticket no encontrado o ya confirmado', 404);
      return;
    }

    successResponse(res, { id }, 'Ticket eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/tickets/:id/confirm
 * Confirma un ticket y crea las compras
 */
export async function confirmTicketHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', 401);
      return;
    }

    const data: ConfirmTicketData = req.body;

    // Validar datos requeridos
    if (!data.storeId) {
      errorResponse(res, 'La tienda es requerida', 400);
      return;
    }

    if (!data.purchaseDate) {
      errorResponse(res, 'La fecha de compra es requerida', 400);
      return;
    }

    if (!data.items || data.items.length === 0) {
      errorResponse(res, 'Los items son requeridos', 400);
      return;
    }

    const result = await confirmTicket(id, userId, data);

    if (!result.success) {
      errorResponse(res, result.error || 'Error al confirmar ticket', 400);
      return;
    }

    successResponse(
      res,
      {
        purchaseId: result.purchaseId,
        purchasesCreated: result.purchasesCreated,
        productsCreated: result.productsCreated,
      },
      'Ticket confirmado exitosamente',
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/tickets/health
 * Verifica la conexión con servicios externos
 */
export async function healthCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ocrConnected = await testOcrConnection();
    const cloudinaryConnected = await testCloudinaryConnection();

    const allHealthy = ocrConnected && cloudinaryConnected;

    if (!allHealthy) {
      errorResponse(
        res,
        'Algunos servicios no están disponibles',
        503,
        {
          ocr: ocrConnected ? 'ok' : 'error',
          cloudinary: cloudinaryConnected ? 'ok' : 'error',
        }
      );
      return;
    }

    successResponse(
      res,
      {
        status: 'ok',
        services: {
          ocr: 'Google Cloud Vision',
          storage: 'Cloudinary',
        },
      },
      'Todos los servicios funcionando correctamente'
    );
  } catch (error) {
    next(error);
  }
}