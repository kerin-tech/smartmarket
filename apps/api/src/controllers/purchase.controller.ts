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

/**
 * GET /purchases
 * Listar compras del usuario con paginación, filtros y joins
 */
export const getPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit, month, productId, storeId, dateFrom, dateTo } = 
      req.query as unknown as PurchaseQueryInput;

    // Construir filtros
    const where: any = {
      userId,
    };

    // Filtro por producto
    if (productId) {
      where.productId = productId;
    }

    // Filtro por tienda
    if (storeId) {
      where.storeId = storeId;
    }

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

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
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
        select: {
          id: true,
          price: true,
          quantity: true,
          date: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              brand: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    // Formatear respuesta
    const formattedPurchases = purchases.map((p) => ({
      id: p.id,
      price: Number(p.price),
      quantity: Number(p.quantity),
      total: Number(p.price) * Number(p.quantity),
      date: p.date,
      createdAt: p.createdAt,
      product: p.product,
      store: p.store,
    }));

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);

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
 * Obtener una compra por ID con producto y tienda
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
      select: {
        id: true,
        price: true,
        quantity: true,
        date: true,
        createdAt: true,
        userId: true,
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            location: true,
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

    // Formatear respuesta
    const { userId: _, ...purchaseData } = purchase;
    const formattedPurchase = {
      ...purchaseData,
      price: Number(purchase.price),
      quantity: Number(purchase.quantity),
      total: Number(purchase.price) * Number(purchase.quantity),
    };

    return successResponse(res, { purchase: formattedPurchase }, "Compra obtenida exitosamente");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /purchases
 * Crear una nueva compra
 */
export const createPurchase = async (
  req: Request<{}, {}, CreatePurchaseInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { productId, storeId, price, quantity, date } = req.body;

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true, name: true, category: true, brand: true, id: true },
    });

    if (!product) {
      return errorResponse(
        res,
        "Producto no encontrado",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (product.userId !== userId) {
      return errorResponse(
        res,
        "El producto no te pertenece",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Verificar que la tienda existe y pertenece al usuario
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { userId: true, name: true, location: true, id: true },
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
        "El local no te pertenece",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Crear compra
    const purchase = await prisma.purchase.create({
      data: {
        productId,
        storeId,
        userId,
        price,
        quantity,
        date: new Date(date),
      },
      select: {
        id: true,
        price: true,
        quantity: true,
        date: true,
        createdAt: true,
      },
    });

    // Formatear respuesta con datos completos
    const formattedPurchase = {
      id: purchase.id,
      price: Number(purchase.price),
      quantity: Number(purchase.quantity),
      total: Number(purchase.price) * Number(purchase.quantity),
      date: purchase.date,
      createdAt: purchase.createdAt,
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
      },
      store: {
        id: store.id,
        name: store.name,
        location: store.location,
      },
    };

    return successResponse(
      res,
      { purchase: formattedPurchase },
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
    const { productId, storeId, price, quantity, date } = req.body;

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

    // Si se actualiza el producto, verificar pertenencia
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { userId: true },
      });

      if (!product) {
        return errorResponse(
          res,
          "Producto no encontrado",
          ERROR_CODES.NOT_FOUND.code
        );
      }

      if (product.userId !== userId) {
        return errorResponse(
          res,
          "El producto no te pertenece",
          ERROR_CODES.FORBIDDEN.code
        );
      }
    }

    // Si se actualiza la tienda, verificar pertenencia
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
          "El local no te pertenece",
          ERROR_CODES.FORBIDDEN.code
        );
      }
    }

    // Construir datos de actualización
    const updateData: any = {};
    if (productId) updateData.productId = productId;
    if (storeId) updateData.storeId = storeId;
    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (date) updateData.date = new Date(date);

    // Actualizar compra
    const purchase = await prisma.purchase.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        price: true,
        quantity: true,
        date: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    // Formatear respuesta
    const formattedPurchase = {
      id: purchase.id,
      price: Number(purchase.price),
      quantity: Number(purchase.quantity),
      total: Number(purchase.price) * Number(purchase.quantity),
      date: purchase.date,
      createdAt: purchase.createdAt,
      product: purchase.product,
      store: purchase.store,
    };

    return successResponse(res, { purchase: formattedPurchase }, "Compra actualizada exitosamente");
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

    // Eliminar compra
    await prisma.purchase.delete({
      where: { id },
    });

    return successResponse(res, null, "Compra eliminada exitosamente");
  } catch (error) {
    next(error);
  }
};