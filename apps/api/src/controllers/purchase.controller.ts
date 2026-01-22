// src/controllers/purchase.controller.ts

import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";
import {
  CreatePurchaseInput,
  UpdatePurchaseInput,
  PurchaseQueryInput,
} from "../schemas/purchase.schema";
import { Prisma } from "@prisma/client";

/**
 * Calcula el total de una compra sumando (quantity * unitPrice) de cada item
 */
function calculatePurchaseTotal(items: { quantity: any; unitPrice: any }[]): number {
  return items.reduce((sum, item) => {
    const quantity = typeof item.quantity === 'object' ? parseFloat(item.quantity.toString()) : item.quantity;
    const unitPrice = typeof item.unitPrice === 'object' ? parseFloat(item.unitPrice.toString()) : item.unitPrice;
    return sum + (quantity * unitPrice);
  }, 0);
}

/**
 * Formatea un item para la respuesta
 */
function formatItem(item: any) {
  const quantity = parseFloat(item.quantity.toString());
  const unitPrice = parseFloat(item.unitPrice.toString());
  
  return {
    id: item.id,
    productId: item.productId,
    quantity,
    unitPrice,
    subtotal: quantity * unitPrice,
    product: item.product ? {
      id: item.product.id,
      name: item.product.name,
      category: item.product.category,
      brand: item.product.brand,
    } : undefined,
  };
}

/**
 * Formatea una compra para la respuesta
 */
function formatPurchase(purchase: any) {
  const items = purchase.items?.map(formatItem) || [];
  const total = calculatePurchaseTotal(items);
  const itemCount = items.length;

  return {
    id: purchase.id,
    date: purchase.date,
    createdAt: purchase.createdAt,
    store: purchase.store ? {
      id: purchase.store.id,
      name: purchase.store.name,
      location: purchase.store.location,
    } : undefined,
    itemCount,
    total,
    items,
  };
}

/**
 * GET /purchases
 * Listar compras del usuario con paginación y filtros
 */
export const getPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit, month, storeId, search } = req.query as unknown as PurchaseQueryInput;

    // Construir filtros
    const where: Prisma.PurchaseWhereInput = {
      userId,
    };

    // Filtro por mes (YYYY-MM)
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Último día del mes
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filtro por local
    if (storeId) {
      where.storeId = storeId;
    }

    // Filtro por búsqueda (busca en productos de la compra)
    if (search) {
      where.items = {
        some: {
          product: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      };
    }

    // Calcular offset
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  brand: true,
                },
              },
            },
          },
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);

    // Formatear respuesta
    const formattedPurchases = purchases.map(formatPurchase);

    return successResponse(
      res,
      {
        purchases: formattedPurchases,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      "Compras obtenidas exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /purchases/:id
 * Obtener una compra por ID
 */
export const getPurchaseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    // Verificar que existe
    if (!purchase) {
      return errorResponse(
        res,
        "Compra no encontrada",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    // Verificar que pertenece al usuario
    if (purchase.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para ver esta compra",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    return successResponse(
      res,
      { purchase: formatPurchase(purchase) },
      "Compra obtenida exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /purchases
 * Crear una nueva compra con items
 */
export const createPurchase = async (
  req: Request<{}, {}, CreatePurchaseInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { storeId, date, items } = req.body;

    // Verificar que el local existe y pertenece al usuario
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { userId: true },
    });

    if (!store) {
      return errorResponse(
        res,
        "Local no encontrado",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (store.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para usar este local",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Verificar que todos los productos existen y pertenecen al usuario
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: { id: true, userId: true },
    });

    // Verificar que todos los productos fueron encontrados
    if (products.length !== productIds.length) {
      return errorResponse(
        res,
        "Uno o más productos no fueron encontrados",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    // Verificar que todos pertenecen al usuario
    const invalidProducts = products.filter((p) => p.userId !== userId);
    if (invalidProducts.length > 0) {
      return errorResponse(
        res,
        "No tienes permiso para usar uno o más productos",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Crear compra con items en una transacción
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        storeId,
        date: new Date(date),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    return successResponse(
      res,
      { purchase: formatPurchase(purchase) },
      "Compra registrada exitosamente",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /purchases/:id
 * Actualizar una compra
 */
export const updatePurchase = async (
  req: Request<{ id: string }, {}, UpdatePurchaseInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { storeId, date, items } = req.body;

    // Verificar que la compra existe y pertenece al usuario
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPurchase) {
      return errorResponse(
        res,
        "Compra no encontrada",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (existingPurchase.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para editar esta compra",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Si se cambia el local, verificar que existe y pertenece al usuario
    if (storeId) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { userId: true },
      });

      if (!store) {
        return errorResponse(
          res,
          "Local no encontrado",
          ERROR_CODES.NOT_FOUND.code
        );
      }

      if (store.userId !== userId) {
        return errorResponse(
          res,
          "No tienes permiso para usar este local",
          ERROR_CODES.FORBIDDEN.code
        );
      }
    }

    // Si se actualizan items, verificar productos
    if (items) {
      const productIds = items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: { id: true, userId: true },
      });

      if (products.length !== productIds.length) {
        return errorResponse(
          res,
          "Uno o más productos no fueron encontrados",
          ERROR_CODES.NOT_FOUND.code
        );
      }

      const invalidProducts = products.filter((p) => p.userId !== userId);
      if (invalidProducts.length > 0) {
        return errorResponse(
          res,
          "No tienes permiso para usar uno o más productos",
          ERROR_CODES.FORBIDDEN.code
        );
      }
    }

    // Actualizar en transacción
    const purchase = await prisma.$transaction(async (tx) => {
      // Si hay items nuevos, eliminar los anteriores y crear los nuevos
      if (items) {
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: id },
        });
      }

      // Actualizar la compra
      return tx.purchase.update({
        where: { id },
        data: {
          ...(storeId && { storeId }),
          ...(date && { date: new Date(date) }),
          ...(items && {
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          }),
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  brand: true,
                },
              },
            },
          },
        },
      });
    });

    return successResponse(
      res,
      { purchase: formatPurchase(purchase) },
      "Compra actualizada exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /purchases/:id
 * Eliminar una compra
 */
export const deletePurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verificar que la compra existe y pertenece al usuario
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPurchase) {
      return errorResponse(
        res,
        "Compra no encontrada",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (existingPurchase.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para eliminar esta compra",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Eliminar compra (los items se eliminan en cascada por el schema)
    await prisma.purchase.delete({
      where: { id },
    });

    return successResponse(res, null, "Compra eliminada exitosamente");
  } catch (error) {
    next(error);
  }
};