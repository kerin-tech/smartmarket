// src/controllers/product.controller.ts

import { Request, Response, NextFunction } from "express";
import prisma from "@/config/database";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../schemas/product.schema";

/**
 * GET /products
 * Listar productos del usuario con paginación y filtros
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit, search, category } = req.query as unknown as ProductQueryInput;

    // Construir filtros
    const where: any = {
      userId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    // Calcular offset
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          category: true,
          brand: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);

    return successResponse(
      res,
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      "Productos obtenidos exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /products/:id
 * Obtener un producto por ID
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        createdAt: true,
        userId: true,
      },
    });

    // Verificar que existe
    if (!product) {
      return errorResponse(
        res,
        "Producto no encontrado",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    // Verificar que pertenece al usuario
    if (product.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para ver este producto",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Remover userId de la respuesta
    const { userId: _, ...productResponse } = product;

    return successResponse(res, { product: productResponse }, "Producto obtenido exitosamente");
  } catch (error) {
    next(error);
  }
};

/**
 * POST /products
 * Crear un nuevo producto
 */
export const createProduct = async (
  req: Request<{}, {}, CreateProductInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { name, category, brand } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        category,
        brand: brand || "",
        userId,
      },
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        createdAt: true,
      },
    });

    return successResponse(
      res,
      { product },
      "Producto creado exitosamente",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /products/:id
 * Actualizar un producto
 */
export const updateProduct = async (
  req: Request<{ id: string }, {}, UpdateProductInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que el producto existe y pertenece al usuario
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProduct) {
      return errorResponse(
        res,
        "Producto no encontrado",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (existingProduct.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para editar este producto",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // Actualizar producto
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        createdAt: true,
      },
    });

    return successResponse(res, { product }, "Producto actualizado exitosamente");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /products/:id
 * Eliminar un producto
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verificar que el producto existe y pertenece al usuario
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProduct) {
      return errorResponse(
        res,
        "Producto no encontrado",
        ERROR_CODES.NOT_FOUND.code
      );
    }

    if (existingProduct.userId !== userId) {
      return errorResponse(
        res,
        "No tienes permiso para eliminar este producto",
        ERROR_CODES.FORBIDDEN.code
      );
    }

    // --- CÓDIGO CORREGIDO ---
    
    // Verificar si tiene detalles de compras asociados
    // Cambiamos 'purchase' por 'purchaseItem' porque ahí es donde vive 'productId'
    const purchasesCount = await prisma.purchaseItem.count({
      where: { productId: id },
    });

    if (purchasesCount > 0) {
      return errorResponse(
        res,
        `No se puede eliminar el producto porque tiene ${purchasesCount} detalle(s) de compra asociado(s)`,
        ERROR_CODES.CONFLICT.code
      );
    }
    
    // -------------------------

    // Eliminar producto
    await prisma.product.delete({
      where: { id },
    });

    return successResponse(res, null, "Producto eliminado exitosamente");
  } catch (error) {
    next(error);
  }
};