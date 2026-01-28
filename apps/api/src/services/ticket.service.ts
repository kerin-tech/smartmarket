// src/services/ticket.service.ts

import { PrismaClient, TicketScanStatus, TicketScanItemStatus } from '@prisma/client';
import { processTicketImage } from './ocr.service';
import { uploadImage, deleteImage } from './cloudinary.service';
import { matchProduct, MatchResult } from './matching.service';
import { detectCategory } from './category.service';

const prisma = new PrismaClient();

export interface TicketItemResponse {
  id: string;
  rawText: string;
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  status: TicketScanItemStatus;
  matchConfidence: number | null;
  matchedProduct: {
    id: string;
    name: string;
    category: string;
    brand: string;
  } | null;
  suggestions: {
    id: string;
    name: string;
    category: string;
    brand: string;
    similarity: number;
  }[];
}

export interface TicketResponse {
  id: string;
  imageUrl: string;
  status: TicketScanStatus;
  storeName: string | null;
  purchaseDate: string | null;
  itemsCount: number;
  totalAmount: number | null;
  items: TicketItemResponse[];
  processingTimeMs: number;
}

export interface ProcessTicketResult {
  success: boolean;
  data?: TicketResponse;
  error?: string;
}

/**
 * Procesa una imagen de ticket completa:
 * 1. Sube a Cloudinary
 * 2. Procesa con OCR
 * 3. Guarda en BD
 * 4. Ejecuta matching
 * 5. Retorna datos para revisión
 */
export async function processTicket(
  userId: string,
  imageBuffer: Buffer
): Promise<ProcessTicketResult> {
  const startTime = Date.now();
  let uploadedImagePublicId: string | null = null;

  try {
    // 1. Subir imagen a Cloudinary
    const uploadResult = await uploadImage(imageBuffer, 'tickets');
    
    if (!uploadResult.success || !uploadResult.url || !uploadResult.publicId) {
      return { success: false, error: 'Error al subir la imagen' };
    }
    
    uploadedImagePublicId = uploadResult.publicId;

    // 2. Procesar con OCR
    const ocrResult = await processTicketImage(imageBuffer);
    
    if (!ocrResult.success || !ocrResult.data) {
      // Eliminar imagen si OCR falla
      await deleteImage(uploadResult.publicId);
      return { success: false, error: ocrResult.error || 'Error procesando OCR' };
    }

    const { storeName, date, lines, total, rawText } = ocrResult.data;

    // 3. Crear TicketScan en BD
    const ticketScan = await prisma.ticketScan.create({
      data: {
        userId,
        imageUrl: uploadResult.url,
        imagePublicId: uploadResult.publicId,
        rawText: rawText,
        status: TicketScanStatus.READY,
        purchaseDate: date ? new Date(date) : null,
        itemsCount: lines.length,
        totalAmount: total ? total : null,
      },
    });

    // 4. Procesar cada línea con matching y guardar
    const itemResponses: TicketItemResponse[] = [];

    for (const line of lines) {
      // Ejecutar matching
      const matchResult = await matchProduct(userId, line.productName || '');
      
      // Determinar estado del item
      let itemStatus: TicketScanItemStatus;
      switch (matchResult.status) {
        case 'MATCHED':
          itemStatus = TicketScanItemStatus.MATCHED;
          break;
        case 'PENDING':
          itemStatus = TicketScanItemStatus.PENDING;
          break;
        default:
          itemStatus = TicketScanItemStatus.NEW;
      }

      // Guardar TicketScanItem
      const ticketItem = await prisma.ticketScanItem.create({
        data: {
          ticketScanId: ticketScan.id,
          rawText: line.rawText,
          detectedName: line.productName || line.rawText,
          detectedPrice: line.totalPrice ? line.totalPrice : null,
          detectedQuantity: line.quantity || 1,
          matchedProductId: matchResult.match?.productId || null,
          matchConfidence: matchResult.match?.similarity || null,
          status: itemStatus,
        },
      });

      // Preparar respuesta del item
      itemResponses.push({
        id: ticketItem.id,
        rawText: line.rawText,
        detectedName: line.productName || line.rawText,
        detectedPrice: line.totalPrice || null,
        detectedQuantity: line.quantity || 1,
        status: itemStatus,
        matchConfidence: matchResult.match?.similarity || null,
        matchedProduct: matchResult.match ? {
          id: matchResult.match.productId,
          name: matchResult.match.name,
          category: matchResult.match.category,
          brand: matchResult.match.brand,
        } : null,
        suggestions: matchResult.suggestions.map(s => ({
          id: s.productId,
          name: s.name,
          category: s.category,
          brand: s.brand,
          similarity: s.similarity,
        })),
      });
    }

    // 5. Retornar respuesta completa
    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      data: {
        id: ticketScan.id,
        imageUrl: uploadResult.url,
        status: ticketScan.status,
        storeName: storeName,
        purchaseDate: date,
        itemsCount: lines.length,
        totalAmount: total,
        items: itemResponses,
        processingTimeMs,
      },
    };

  } catch (error) {
    // Limpiar imagen si algo falla
    if (uploadedImagePublicId) {
      await deleteImage(uploadedImagePublicId);
    }
    
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error procesando ticket:', message);
    return { success: false, error: message };
  }
}

/**
 * Obtiene un ticket por ID
 */
export async function getTicketById(
  ticketId: string,
  userId: string
): Promise<TicketResponse | null> {
  const ticket = await prisma.ticketScan.findFirst({
    where: {
      id: ticketId,
      userId,
    },
    include: {
      items: {
        include: {
          matchedProduct: true,
        },
      },
      store: true,
    },
  });

  if (!ticket) {
    return null;
  }

  // Obtener sugerencias para items pendientes
  const itemResponses: TicketItemResponse[] = [];

  for (const item of ticket.items) {
    let suggestions: TicketItemResponse['suggestions'] = [];

    // Si está pendiente, buscar sugerencias
    if (item.status === TicketScanItemStatus.PENDING) {
      const matchResult = await matchProduct(userId, item.detectedName);
      suggestions = matchResult.suggestions.map(s => ({
        id: s.productId,
        name: s.name,
        category: s.category,
        brand: s.brand,
        similarity: s.similarity,
      }));
    }

    itemResponses.push({
      id: item.id,
      rawText: item.rawText,
      detectedName: item.detectedName,
      detectedPrice: item.detectedPrice ? Number(item.detectedPrice) : null,
      detectedQuantity: Number(item.detectedQuantity),
      status: item.status,
      matchConfidence: item.matchConfidence,
      matchedProduct: item.matchedProduct ? {
        id: item.matchedProduct.id,
        name: item.matchedProduct.name,
        category: item.matchedProduct.category,
        brand: item.matchedProduct.brand,
      } : null,
      suggestions,
    });
  }

  return {
    id: ticket.id,
    imageUrl: ticket.imageUrl,
    status: ticket.status,
    storeName: ticket.store?.name || null,
    purchaseDate: ticket.purchaseDate?.toISOString().split('T')[0] || null,
    itemsCount: ticket.itemsCount,
    totalAmount: ticket.totalAmount ? Number(ticket.totalAmount) : null,
    items: itemResponses,
    processingTimeMs: 0,
  };
}

/**
 * Lista tickets del usuario
 */
export async function getUserTickets(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ tickets: any[]; total: number }> {
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    prisma.ticketScan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        store: true,
      },
    }),
    prisma.ticketScan.count({ where: { userId } }),
  ]);

  return {
    tickets: tickets.map(t => ({
      id: t.id,
      imageUrl: t.imageUrl,
      status: t.status,
      storeName: t.store?.name || null,
      purchaseDate: t.purchaseDate?.toISOString().split('T')[0] || null,
      itemsCount: t.itemsCount,
      totalAmount: t.totalAmount ? Number(t.totalAmount) : null,
      createdAt: t.createdAt,
    })),
    total,
  };
}

/**
 * Elimina un ticket (solo si no está confirmado)
 */
export async function deleteTicket(
  ticketId: string,
  userId: string
): Promise<boolean> {
  const ticket = await prisma.ticketScan.findFirst({
    where: {
      id: ticketId,
      userId,
      status: { not: TicketScanStatus.CONFIRMED },
    },
  });

  if (!ticket) {
    return false;
  }

  // Eliminar imagen de Cloudinary
  await deleteImage(ticket.imagePublicId);

  // Eliminar de BD (cascade eliminará items)
  await prisma.ticketScan.delete({
    where: { id: ticketId },
  });

  return true;
}

/**
 * Confirma un ticket: crea productos nuevos y registra compras
 */
export interface ConfirmTicketItem {
  id: string;
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  matchedProductId: string | null;
  status: string;
}

export interface ConfirmTicketData {
  storeId: string;
  purchaseDate: string;
  items: ConfirmTicketItem[];
}

export interface ConfirmTicketResult {
  success: boolean;
  purchaseId?: string;
  purchasesCreated?: number;
  productsCreated?: number;
  error?: string;
}

export async function confirmTicket(
  ticketId: string,
  userId: string,
  data: ConfirmTicketData
): Promise<ConfirmTicketResult> {
  try {
    // 1. Verificar que el ticket existe y pertenece al usuario
    const ticket = await prisma.ticketScan.findFirst({
      where: {
        id: ticketId,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket no encontrado' };
    }

    if (ticket.status === TicketScanStatus.CONFIRMED) {
      return { success: false, error: 'El ticket ya fue confirmado' };
    }

    // 2. Verificar que el store pertenece al usuario
    const store = await prisma.store.findFirst({
      where: {
        id: data.storeId,
        userId,
      },
    });

    if (!store) {
      return { success: false, error: 'Tienda no encontrada' };
    }

    // 3. Filtrar items activos (no ignorados)
    const activeItems = data.items.filter((item) => item.status !== 'IGNORED');

    if (activeItems.length === 0) {
      return { success: false, error: 'No hay productos para confirmar' };
    }

    // 4. Ejecutar transacción
    let productsCreated = 0;
    let purchasesCreated = 0;

    const result = await prisma.$transaction(async (tx) => {
      // Crear la compra (Purchase)
      const purchase = await tx.purchase.create({
        data: {
          userId,
          storeId: data.storeId,
          ticketScanId: ticketId,
          date: new Date(data.purchaseDate),
        },
      });

      // Procesar cada item
      for (const item of activeItems) {
        let productId = item.matchedProductId;

        // Si es un producto nuevo (no tiene matchedProductId), crearlo
        if (!productId || item.status === 'NEW') {
          const category = detectCategory(item.detectedName);
          
          const newProduct = await tx.product.create({
            data: {
              userId,
              name: item.detectedName,
              category: category,
              brand: '',
            },
          });
          productId = newProduct.id;
          productsCreated++;
        }

        // Crear el item de compra (PurchaseItem)
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: productId,
            quantity: item.detectedQuantity || 1,
            unitPrice: item.detectedPrice || 0,
          },
        });

        purchasesCreated++;

        // Actualizar el TicketScanItem
        await tx.ticketScanItem.update({
          where: { id: item.id },
          data: {
            finalProductId: productId,
            status: TicketScanItemStatus.CONFIRMED,
          },
        });
      }

      // Actualizar el ticket como confirmado
      await tx.ticketScan.update({
        where: { id: ticketId },
        data: {
          status: TicketScanStatus.CONFIRMED,
          storeId: data.storeId,
          purchaseDate: new Date(data.purchaseDate),
          confirmedAt: new Date(),
        },
      });

      return purchase;
    });

    return {
      success: true,
      purchaseId: result.id,
      purchasesCreated,
      productsCreated,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error confirmando ticket:', message);
    return { success: false, error: message };
  }
}