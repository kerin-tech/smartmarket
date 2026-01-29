// src/services/ticket.service.ts

import { PrismaClient, TicketScanStatus, TicketScanItemStatus } from '@prisma/client';
import { processTicketImage } from './ocr.service';
import { uploadImage, deleteImage } from './cloudinary.service';
import { matchProduct } from './matching.service';
import { detectCategory } from './category.service';
import { parseTicket, detectStore, ParsedTicket } from '../parsers';

const prisma = new PrismaClient();

// ============ INTERFACES ============

export interface TicketItemResponse {
  id: string;
  rawText: string;
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  status: TicketScanItemStatus;
  matchConfidence: number | null;
  itemCode: string | null;
  unit: string;
  parseConfidence: number | null;
  flags: string[];
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
  storeKey: string | null;
  storeConfidence: number | null;
  needsStoreConfirmation: boolean;
  purchaseDate: string | null;
  itemsCount: number;
  totalAmount: number | null;
  items: TicketItemResponse[];
  processingTimeMs: number;
  parserUsed: string | null;
  warnings: string[];
}

export interface ProcessTicketResult {
  success: boolean;
  data?: TicketResponse;
  error?: string;
}

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

// ============ FUNCIONES ============

/**
 * Procesa una imagen de ticket completa
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
      await deleteImage(uploadResult.publicId);
      return { success: false, error: ocrResult.error || 'Error procesando OCR' };
    }

    const rawText = ocrResult.data.rawText;

    // 3. Detectar tienda y parsear con el parser apropiado
    const detection = detectStore(rawText);
    let parsedTicket: ParsedTicket;

    try {
      parsedTicket = parseTicket(rawText);
    } catch (parseError) {
      // Si el parser falla, usar datos del OCR directamente
      console.warn('⚠️ Parser falló, usando OCR directo:', parseError);
      parsedTicket = createFallbackParsedTicket(ocrResult.data, rawText);
    }

    // 4. Crear TicketScan en BD
    const ticketScan = await prisma.ticketScan.create({
      data: {
        userId,
        imageUrl: uploadResult.url,
        imagePublicId: uploadResult.publicId,
        rawText,
        status: TicketScanStatus.READY,
        purchaseDate: parsedTicket.date.value,
        itemsCount: parsedTicket.items.length,
        totalAmount: parsedTicket.totals.total || null,
        detectedStoreKey: parsedTicket.store.key,
        detectedStoreName: parsedTicket.store.name,
        detectionConfidence: parsedTicket.store.confidence,
        parserUsed: parsedTicket.meta.parserUsed,
      },
    });

    console.log('=== RAW TEXT ===');
console.log(rawText);
console.log('================');

    // 5. Procesar cada item con matching
    const itemResponses: TicketItemResponse[] = [];

    for (const item of parsedTicket.items) {
      const matchResult = await matchProduct(userId, item.description);

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

      const ticketItem = await prisma.ticketScanItem.create({
        data: {
          ticketScanId: ticketScan.id,
          rawText: item.rawLine,
          detectedName: item.description,
          detectedPrice: item.totalPrice || null,
          detectedQuantity: item.quantity || 1,
          matchedProductId: matchResult.match?.productId || null,
          matchConfidence: matchResult.match?.similarity || null,
          status: itemStatus,
          itemCode: item.code || null,
          unit: item.unit || 'UN',
          parseConfidence: item.confidence,
          flags: item.flags || [],
        },
      });

      itemResponses.push({
        id: ticketItem.id,
        rawText: item.rawLine,
        detectedName: item.description,
        detectedPrice: item.totalPrice || null,
        detectedQuantity: item.quantity || 1,
        status: itemStatus,
        matchConfidence: matchResult.match?.similarity || null,
        itemCode: item.code || null,
        unit: item.unit || 'UN',
        parseConfidence: item.confidence,
        flags: item.flags || [],
        matchedProduct: matchResult.match
          ? {
              id: matchResult.match.productId,
              name: matchResult.match.name,
              category: matchResult.match.category,
              brand: matchResult.match.brand,
            }
          : null,
        suggestions: matchResult.suggestions.map((s) => ({
          id: s.productId,
          name: s.name,
          category: s.category,
          brand: s.brand,
          similarity: s.similarity,
        })),
      });
    }

    // 6. Retornar respuesta
    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      data: {
        id: ticketScan.id,
        imageUrl: uploadResult.url,
        status: ticketScan.status,
        storeName: parsedTicket.store.name,
        storeKey: parsedTicket.store.key,
        storeConfidence: parsedTicket.store.confidence,
        needsStoreConfirmation: detection.needsConfirmation,
        purchaseDate: parsedTicket.date.value?.toISOString().split('T')[0] || null,
        itemsCount: parsedTicket.items.length,
        totalAmount: parsedTicket.totals.total || null,
        items: itemResponses,
        processingTimeMs,
        parserUsed: parsedTicket.meta.parserUsed,
        warnings: parsedTicket.meta.warnings,
      },
    };
  } catch (error) {
    if (uploadedImagePublicId) {
      await deleteImage(uploadedImagePublicId);
    }

    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error procesando ticket:', message);
    return { success: false, error: message };
  }
}

/**
 * Crea un ParsedTicket de fallback cuando el parser falla
 */
function createFallbackParsedTicket(ocrData: any, rawText: string): ParsedTicket {
  return {
    store: {
      key: 'generic',
      name: ocrData.storeName || 'Tienda Desconocida',
      confidence: 0.3,
    },
    date: {
      value: ocrData.date ? new Date(ocrData.date) : null,
      raw: ocrData.date || '',
      confidence: 0.5,
    },
    items: (ocrData.lines || []).map((line: any, i: number) => ({
      lineNumber: i + 1,
      rawLine: line.rawText || '',
      description: line.productName || line.rawText || '',
      quantity: line.quantity || 1,
      unitPrice: line.unitPrice || line.totalPrice || 0,
      totalPrice: line.totalPrice || 0,
      confidence: line.confidence || 0.5,
      unit: 'UN',
      flags: ['ocr_fallback'],
    })),
    totals: {
      total: ocrData.total || 0,
      confidence: 0.5,
    },
    meta: {
      parserUsed: 'ocr-fallback',
      parsedAt: new Date(),
      rawText,
      warnings: ['Parser falló, usando datos de OCR directamente'],
    },
  };
}

/**
 * Obtiene un ticket por ID
 */
export async function getTicketById(
  ticketId: string,
  userId: string
): Promise<TicketResponse | null> {
  const ticket = await prisma.ticketScan.findFirst({
    where: { id: ticketId, userId },
    include: {
      items: { include: { matchedProduct: true } },
      store: true,
    },
  });

  if (!ticket) return null;

  const itemResponses: TicketItemResponse[] = [];

  for (const item of ticket.items) {
    let suggestions: TicketItemResponse['suggestions'] = [];

    if (item.status === TicketScanItemStatus.PENDING) {
      const matchResult = await matchProduct(userId, item.detectedName);
      suggestions = matchResult.suggestions.map((s) => ({
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
      itemCode: item.itemCode,
      unit: item.unit || 'UN',
      parseConfidence: item.parseConfidence,
      flags: item.flags || [],
      matchedProduct: item.matchedProduct
        ? {
            id: item.matchedProduct.id,
            name: item.matchedProduct.name,
            category: item.matchedProduct.category,
            brand: item.matchedProduct.brand,
          }
        : null,
      suggestions,
    });
  }

  return {
    id: ticket.id,
    imageUrl: ticket.imageUrl,
    status: ticket.status,
    storeName: ticket.detectedStoreName || ticket.store?.name || null,
    storeKey: ticket.detectedStoreKey || null,
    storeConfidence: ticket.detectionConfidence,
    needsStoreConfirmation: (ticket.detectionConfidence || 0) < 0.7,
    purchaseDate: ticket.purchaseDate?.toISOString().split('T')[0] || null,
    itemsCount: ticket.itemsCount,
    totalAmount: ticket.totalAmount ? Number(ticket.totalAmount) : null,
    items: itemResponses,
    processingTimeMs: 0,
    parserUsed: ticket.parserUsed,
    warnings: [],
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
      include: { store: true },
    }),
    prisma.ticketScan.count({ where: { userId } }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      imageUrl: t.imageUrl,
      status: t.status,
      storeName: t.detectedStoreName || t.store?.name || null,
      storeKey: t.detectedStoreKey,
      purchaseDate: t.purchaseDate?.toISOString().split('T')[0] || null,
      itemsCount: t.itemsCount,
      totalAmount: t.totalAmount ? Number(t.totalAmount) : null,
      parserUsed: t.parserUsed,
      createdAt: t.createdAt,
    })),
    total,
  };
}

/**
 * Elimina un ticket (solo si no está confirmado)
 */
export async function deleteTicket(ticketId: string, userId: string): Promise<boolean> {
  const ticket = await prisma.ticketScan.findFirst({
    where: {
      id: ticketId,
      userId,
      status: { not: TicketScanStatus.CONFIRMED },
    },
  });

  if (!ticket) return false;

  await deleteImage(ticket.imagePublicId);
  await prisma.ticketScan.delete({ where: { id: ticketId } });

  return true;
}

/**
 * Confirma un ticket y crea las compras
 */
export async function confirmTicket(
  ticketId: string,
  userId: string,
  data: ConfirmTicketData
): Promise<ConfirmTicketResult> {
  try {
    const ticket = await prisma.ticketScan.findFirst({
      where: { id: ticketId, userId },
      include: { items: true },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket no encontrado' };
    }

    if (ticket.status === TicketScanStatus.CONFIRMED) {
      return { success: false, error: 'El ticket ya fue confirmado' };
    }

    const store = await prisma.store.findFirst({
      where: { id: data.storeId, userId },
    });

    if (!store) {
      return { success: false, error: 'Tienda no encontrada' };
    }

    const activeItems = data.items.filter((item) => item.status !== 'IGNORED');

    if (activeItems.length === 0) {
      return { success: false, error: 'No hay productos para confirmar' };
    }

    let productsCreated = 0;
    let purchasesCreated = 0;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          userId,
          storeId: data.storeId,
          ticketScanId: ticketId,
          date: new Date(data.purchaseDate),
        },
      });

      for (const item of activeItems) {
        let productId = item.matchedProductId;

        if (!productId || item.status === 'NEW') {
          const category = detectCategory(item.detectedName);

          const newProduct = await tx.product.create({
            data: {
              userId,
              name: item.detectedName,
              category,
              brand: '',
            },
          });
          productId = newProduct.id;
          productsCreated++;
        }

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId,
            quantity: item.detectedQuantity || 1,
            unitPrice: item.detectedPrice || 0,
          },
        });

        purchasesCreated++;

        await tx.ticketScanItem.update({
          where: { id: item.id },
          data: {
            finalProductId: productId,
            status: TicketScanItemStatus.CONFIRMED,
          },
        });
      }

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