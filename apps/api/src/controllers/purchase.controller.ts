// src/controllers/purchase.controller.ts
import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";
import { visionService } from "../services/vision.service";
import { purchaseService } from "../services/purchase.service"; // Importación nueva
import { CreatePurchaseInput, UpdatePurchaseInput, PurchaseQueryInput, ScanTicketInput } from "../schemas/purchase.schema";
import { Prisma } from "@prisma/client";

// --- HELPERS DE FORMATO ---

// Calcula el total restando el descuento
function calculatePurchaseTotal(items: any[]): number {
  return items.reduce((sum, item) => {
    const quantity = typeof item.quantity === 'object' ? parseFloat(item.quantity.toString()) : item.quantity;
    const unitPrice = typeof item.unitPrice === 'object' ? parseFloat(item.unitPrice.toString()) : item.unitPrice;
    const discount = item.discountPercentage || 0;
    
    const subtotal = (quantity * unitPrice) * (1 - (discount / 100));
    return sum + subtotal;
  }, 0);
}

function formatItem(item: any) {
  const quantity = parseFloat(item.quantity.toString());
  const unitPrice = parseFloat(item.unitPrice.toString());
  const discountPercentage = item.discountPercentage || 0;
  const subtotal = (quantity * unitPrice) * (1 - (discountPercentage / 100));
  
  return {
    id: item.id,
    productId: item.productId,
    quantity,
    unitPrice,
    discountPercentage,
    subtotal: Number(subtotal.toFixed(2)),
    product: item.product ? {
      id: item.product.id,
      name: item.product.name,
      category: item.product.category,
      brand: item.product.brand,
    } : undefined,
  };
}

function formatPurchase(purchase: any) {
  const items = purchase.items?.map(formatItem) || [];
  const total = calculatePurchaseTotal(items);
  return {
    id: purchase.id,
    date: purchase.date,
    createdAt: purchase.createdAt,
    store: purchase.store,
    itemCount: items.length,
    total: Number(total.toFixed(2)),
    items,
  };
}

// --- ENDPOINTS NUEVOS: IA & SCANNING ---

/**
 * Recibe una imagen, extrae datos con IA y busca coincidencias con productos existentes.
 * NO guarda en BD, solo retorna JSON para revisión.
 */
export const scanTicket = async (req: Request<{}, {}, ScanTicketInput>, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    const userId = req.user!.id;

      console.log("Image length:", image?.length);
    console.log("Image prefix:", image?.substring(0, 50));

    // Llama al servicio de visión mejorado (con Matching)
    const scanResult = await visionService.scanAndMatch(userId, image);

    return successResponse(
      res, 
      scanResult, 
      "Ticket escaneado. Por favor revisa y confirma los datos."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Recibe el JSON revisado por el usuario y persiste la compra y productos nuevos en la BD.
 */
export const confirmTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Si en Postman envías el objeto completo que recibiste de /scan,
    // es probable que los datos estén dentro de una propiedad 'data'
    const payload = req.body.data ? req.body.data : req.body; 
    const userId = req.user!.id;

    // Validación rápida antes de llamar al servicio
    if (!payload.items || !Array.isArray(payload.items)) {
      return errorResponse(res, "El formato de los items es inválido o está vacío", 400);
    }

    const purchase = await purchaseService.confirmPurchase(userId, payload);

    return successResponse(
      res, 
      { purchase: formatPurchase(purchase) }, 
      "Compra registrada y procesada exitosamente", 
      201
    );
  } catch (error) {
    next(error);
  }
};

// --- ENDPOINTS CRUD EXISTENTES ---

export const getPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page, limit, month, storeId, search } = req.query as unknown as PurchaseQueryInput;
    const where: Prisma.PurchaseWhereInput = { userId };
    
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      where.date = { gte: new Date(year, monthNum - 1, 1), lte: new Date(year, monthNum, 0) };
    }
    if (storeId) where.storeId = storeId;
    if (search) where.items = { some: { product: { name: { contains: search, mode: "insensitive" } } } };

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: "desc" }, include: { store: true, items: { include: { product: true } } } }),
      prisma.purchase.count({ where }),
    ]);

    return successResponse(res, { purchases: purchases.map(formatPurchase), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, "Compras obtenidas");
  } catch (error) { next(error); }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchase.findUnique({ where: { id }, include: { store: true, items: { include: { product: true } } } });
    if (!purchase || purchase.userId !== req.user!.id) return errorResponse(res, "No encontrada", ERROR_CODES.NOT_FOUND.code);
    return successResponse(res, { purchase: formatPurchase(purchase) }, "Compra obtenida");
  } catch (error) { next(error); }
};

export const createPurchase = async (req: Request<{}, {}, CreatePurchaseInput>, res: Response, next: NextFunction) => {
  try {
    const { storeId, date, items } = req.body;
    const purchase = await prisma.purchase.create({
      data: {
        userId: req.user!.id,
        storeId,
        date: new Date(date),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercentage: item.discountPercentage || 0
          }))
        }
      },
      include: { store: true, items: { include: { product: true } } }
    });
    return successResponse(res, { purchase: formatPurchase(purchase) }, "Registrada", 201);
  } catch (error) { next(error); }
};

export const updatePurchase = async (req: Request<{ id: string }, {}, UpdatePurchaseInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { storeId, date, items } = req.body;
    const purchase = await prisma.$transaction(async (tx) => {
      if (items) await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      return tx.purchase.update({
        where: { id },
        data: {
          ...(storeId && { storeId }),
          ...(date && { date: new Date(date) }),
          ...(items && {
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPercentage: item.discountPercentage || 0
              }))
            }
          })
        },
        include: { store: true, items: { include: { product: true } } }
      });
    });
    return successResponse(res, { purchase: formatPurchase(purchase) }, "Actualizada");
  } catch (error) { next(error); }
};

export const deletePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.purchase.delete({ where: { id: req.params.id } });
    return successResponse(res, null, "Eliminada");
  } catch (error) { next(error); }
};