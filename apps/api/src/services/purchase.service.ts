// apps/api/src/services/purchase.service.ts
import prisma from "@/config/database";
import { Prisma } from "@prisma/client";

export const purchaseService = {
  
  async confirmPurchase(userId: string, payload: any) {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Gestionar Tienda (Upsert)
      const storeName = payload.detected_store || "Tienda Genérica";
      let store = await tx.store.findFirst({
        where: { userId, name: { equals: storeName, mode: "insensitive" } }
      });

      if (!store) {
        store = await tx.store.create({
          data: { name: storeName, userId, location: "General" }
        });
      }

      // 2. Crear Cabecera de Compra
      const purchase = await tx.purchase.create({
        data: {
          userId,
          storeId: store.id,
          date: new Date(payload.detected_date || new Date()),
        }
      });

      // 3. Procesar Items
      const purchaseItemsData: Prisma.PurchaseItemCreateManyInput[] = [];

      for (const item of payload.items) {
        let finalProductId: string;

        // CASO A: Match de Producto confirmado (ya existe en la DB)
        if (item.match && item.match.product_id) {
          finalProductId = item.match.product_id;
        } 
        // CASO B: Producto Nuevo o sin match directo
        else {
          const existing = await tx.product.findFirst({
            where: { userId, name: { equals: item.detected_name, mode: "insensitive" } }
          });

          if (existing) {
            finalProductId = existing.id;
          } else {
            // --- LÓGICA DE MATCHING DE CATEGORÍA ---
            // Buscamos si el usuario ya tiene esta categoría registrada en otros productos
            const suggestedCategory = item.detected_category || "General";
            
            const categoryMatch = await tx.product.findFirst({
              where: { 
                userId, 
                category: { equals: suggestedCategory, mode: "insensitive" } 
              },
              select: { category: true }
            });

            const newProd = await tx.product.create({
              data: {
                userId,
                name: item.detected_name,
                // Si encontramos un match de texto, usamos el nombre exacto de la DB (ej. "Hogar" vs "hogar")
                category: categoryMatch ? categoryMatch.category : suggestedCategory,
                brand: item.detected_brand || "Genérica"
              }
            });
            finalProductId = newProd.id;
          }
        }

        // Preparar data para inserción masiva
        purchaseItemsData.push({
          purchaseId: purchase.id,
          productId: finalProductId,
          quantity: item.detected_quantity,
          unitPrice: item.detected_price,
          discountPercentage: item.discountPercentage || 0
        });
      }

      // 4. Insertar todos los detalles en masa (bulk insert)
      if (purchaseItemsData.length > 0) {
        await tx.purchaseItem.createMany({
          data: purchaseItemsData
        });
      }

      // Retornar la compra completa con sus relaciones para el frontend
      return await tx.purchase.findUnique({
        where: { id: purchase.id },
        include: {
          store: true,
          items: {
            include: { product: true }
          }
        }
      });
    });
  }
};