// apps/api/src/services/purchase.service.ts
import prisma from "@/config/database";
import { Prisma } from "@prisma/client";

export const purchaseService = {
  
  async confirmPurchase(userId: string, payload: any) {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Gestionar Tienda
      let storeId: string;

      if (payload.selected_store_id) {
        const existingStore = await tx.store.findFirst({
          where: { id: payload.selected_store_id, userId }
        });
        
        if (!existingStore) {
          throw new Error("La tienda seleccionada no existe");
        }
        storeId = existingStore.id;
      } 
      else {
        const storeName = payload.detected_store || "Tienda Genérica";
        
        let store = await tx.store.findFirst({
          where: { userId, name: { equals: storeName, mode: "insensitive" } }
        });

        if (!store) {
          store = await tx.store.create({
            data: { name: storeName, userId, location: "General" }
          });
        }
        storeId = store.id;
      }

      // 2. Crear Cabecera de Compra
      // Parsear la fecha correctamente - puede venir como "YYYY-MM-DD" o ISO string
      let purchaseDate: Date;
      
      if (payload.detected_date) {
        const dateStr = payload.detected_date;
        
        // Si viene como "YYYY-MM-DD", añadir tiempo para evitar problemas de timezone
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          purchaseDate = new Date(`${dateStr}T12:00:00`);
        } else {
          purchaseDate = new Date(dateStr);
        }
        
        // Validar que la fecha sea válida
        if (isNaN(purchaseDate.getTime())) {
          console.warn(`Fecha inválida recibida: ${dateStr}, usando fecha actual`);
          purchaseDate = new Date();
        }
      } else {
        purchaseDate = new Date();
      }

      const purchase = await tx.purchase.create({
        data: {
          userId,
          storeId,
          date: purchaseDate,
        }
      });

      // 3. Procesar Items
      const purchaseItemsData: Prisma.PurchaseItemCreateManyInput[] = [];

      for (const item of payload.items) {
        let finalProductId: string;

        // CASO A: Usuario aceptó un match (producto existente)
        if (item.match && item.match.product_id && item.user_decision === 'accept_match') {
          const existingProduct = await tx.product.findFirst({
            where: { id: item.match.product_id, userId }
          });
          
          if (existingProduct) {
            finalProductId = existingProduct.id;
          } else {
            const newProd = await tx.product.create({
              data: {
                userId,
                name: item.detected_name,
                category: item.detected_category || "Otros",
                brand: item.detected_brand || "Genérica"
              }
            });
            finalProductId = newProd.id;
          }
        } 
        // CASO B: Crear producto nuevo
        else {
          const existing = await tx.product.findFirst({
            where: { userId, name: { equals: item.detected_name, mode: "insensitive" } }
          });

          if (existing) {
            finalProductId = existing.id;
          } else {
            const categoryMatch = await tx.product.findFirst({
              where: { 
                userId, 
                category: { equals: item.detected_category || "Otros", mode: "insensitive" } 
              },
              select: { category: true }
            });

            const newProd = await tx.product.create({
              data: {
                userId,
                name: item.detected_name,
                category: categoryMatch?.category || item.detected_category || "Otros",
                brand: item.detected_brand || "Genérica"
              }
            });
            finalProductId = newProd.id;
          }
        }

        // Preparar data para inserción masiva
        // Frontend envía "discount_percentage" (snake_case), backend usa "discountPercentage" (camelCase)
        const discountPct = item.discount_percentage ?? item.discountPercentage ?? 0;
        
        purchaseItemsData.push({
          purchaseId: purchase.id,
          productId: finalProductId,
          quantity: item.detected_quantity,
          unitPrice: item.detected_price,
          discountPercentage: discountPct
        });
      }

      // 4. Insertar todos los detalles en masa
      if (purchaseItemsData.length > 0) {
        await tx.purchaseItem.createMany({
          data: purchaseItemsData
        });
      }

      // Retornar la compra completa
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