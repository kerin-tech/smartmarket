// src/controllers/store.controller.ts

import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";
import {
  CreateStoreInput,
  UpdateStoreInput,
  StoreQueryInput,
} from "../schemas/store.schema";

/**
 * GET /stores
 * Listar tiendas del usuario con paginación y filtros
 */
export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit, search } = req.query as unknown as StoreQueryInput;

    // Construir filtros
    const where: any = {
      userId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calcular offset
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          location: true,
          createdAt: true,
        },
      }),
      prisma.store.count({ where }),
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);

    return successResponse(
      res,
      {
        stores,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      "Tiendas obtenidas exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stores/:id
 * Obtener una tienda por ID
 */
export const getStoreById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        userId: true,
      },
    });

    // Verificar que existe
    if (!store) {
      return errorResponse(
        res,
        "Tienda no encontrada",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    // Verificar que pertenece al usuario
    if (store.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para ver esta tienda",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Remover userId de la respuesta
    const { userId: _, ...storeResponse } = store;

    return successResponse(res, { store: storeResponse }, "Tienda obtenida exitosamente");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /stores
 * Crear una nueva tienda
 */
export const createStore = async (
  req: Request<{}, {}, CreateStoreInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { name, location } = req.body;

    const store = await prisma.store.create({
      data: {
        name,
        location: location || "",
        userId,
      },
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
      },
    });

    return successResponse(
      res,
      { store },
      "Tienda creada exitosamente",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /stores/:id
 * Actualizar una tienda
 */
export const updateStore = async (
  req: Request<{ id: string }, {}, UpdateStoreInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que la tienda existe y pertenece al usuario
    const existingStore = await prisma.store.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingStore) {
      return errorResponse(
        res,
        "Tienda no encontrada",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (existingStore.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para editar esta tienda",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Actualizar tienda
    const store = await prisma.store.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
      },
    });

    return successResponse(res, { store }, "Tienda actualizada exitosamente");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /stores/:id
 * Eliminar una tienda
 */
export const deleteStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verificar que la tienda existe y pertenece al usuario
    const existingStore = await prisma.store.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingStore) {
      return errorResponse(
        res,
        "Tienda no encontrada",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (existingStore.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para eliminar esta tienda",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Verificar si tiene compras asociadas
    const purchasesCount = await prisma.purchase.count({
      where: { storeId: id },
    });

    if (purchasesCount > 0) {
      return errorResponse(
        res,
        `No se puede eliminar la tienda porque tiene ${purchasesCount} compra(s) asociada(s)`,
        ERROR_CODES.CONFLICT.code
      );
    }

    // Eliminar tienda
    await prisma.store.delete({
      where: { id },
    });

    return successResponse(res, null, "Tienda eliminada exitosamente");
  } catch (error) {
    next(error);
  }
};