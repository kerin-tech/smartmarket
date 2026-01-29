import OpenAI from "openai";
import prisma from "@/config/database";
import { distance } from "fastest-levenshtein";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProductMatch {
  product_id: string;
  name: string;
  confidence: number;
}

export const visionService = {
  async scanAndMatch(userId: string, base64Image: string) {
    const aiData = await this.extractDataFromTicket(base64Image);
    
    if (!aiData) throw new Error("No se pudo extraer información del ticket");

    const userProducts = await prisma.product.findMany({
      where: { userId },
      select: { id: true, name: true, category: true } // Traemos categoría para el contexto
    });

    const itemsWithMatch = aiData.items.map((item: any) => {
      const match = this.findBestMatch(item.productName, userProducts);

      return {
        raw_text: item.productName.toUpperCase(),
        detected_name: item.productName,
        detected_price: item.unitPrice,
        detected_quantity: item.quantity,
        detected_category: item.category, // <--- Enviamos la categoría detectada
        detected_brand: item.brand || "Genérica",
        match: match
      };
    });

    return {
      ticket_id: crypto.randomUUID(),
      detected_date: aiData.date,
      detected_store: aiData.storeName,
      items: itemsWithMatch
    };
  },

async extractDataFromTicket(base64Image: string) {
    // Definimos tus categorías reales para dárselas a la IA
    const validCategories = [
      'Frutas', 'Verduras', 'Granos', 'Lácteos', 'Carnes', 'Bebidas', 
      'Limpieza', 'Otros', 'Despensa', 'Panadería', 'Pescados', 
      'Huevos', 'Licores', 'Cuidado Personal', 'Mascotas', 'Bebés', 'Congelados'
    ];

    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
           content: `Eres un Analista de Inventario experto en procesamiento de facturas de consumo masivo (Retail/Grocery).
          
          OBJETIVO:
          Extraer con precisión quirúrgica los productos de un ticket, normalizando nombres y clasificándolos para una App de Gestión de Cocina e Inventario.

          REGLAS DE EXTRACCIÓN:
          1. **Limpieza de Nombres**: Elimina códigos internos, asteriscos o símbolos de impuestos (Ej: "CONG. POLLO *123" -> "Pollo Congelado"). 
          2. **Manejo de Cantidades**: 
             - Si es por peso (Kg/Lb), usa el valor decimal en 'quantity'.
             - Si el ticket dice "2 x 5000", quantity es 2 y unitPrice es 5000.
          3. **Lógica de Descuentos**: Si un item tiene un descuento inmediatamente debajo, resta el valor del 'unitPrice' o regístralo de forma que el precio final sea el pagado.
          4. **Categorización Estricta**: Debes elegir el mejor match de esta lista: [${validCategories.join(", ")}].
          5. **Contexto de Cocina**: Prioriza entender que los productos son para consumo o mantenimiento del hogar.

          REGLAS DE SEGURIDAD:
          - Si el texto está borroso, haz tu mejor esfuerzo por inferir el producto basado en el precio.
          - Ignora secciones de "Cambio", "Puntos" o "Ahorro total" al final del ticket.`
        },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analiza la imagen y genera un JSON con esta estructura:
                {
                  "storeName": "nombre de la tienda",
                  "date": "ISO Date",
                  "items": [
                    {
                      "productName": "nombre limpio",
                      "quantity": 1.0,
                      "unitPrice": 1000,
                      "category": "Una de las categorías permitidas",
                      "brand": "marca detectada o null"
                    }
                  ]
                }` 
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${cleanBase64}`, detail: "high" }
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error("Error en VisionService:", error);
      throw new Error("Error al extraer datos con contexto");
    }
  },

  findBestMatch(detectedName: string, existingProducts: any[]): ProductMatch | null {
    const THRESHOLD = 0.8;
    const normalizedInput = this.normalize(detectedName);
    
    let bestMatch: ProductMatch | null = null;
    let highestScore = 0;

    for (const prod of existingProducts) {
      const normalizedProd = this.normalize(prod.name);
      const dist = distance(normalizedInput, normalizedProd);
      const maxLength = Math.max(normalizedInput.length, normalizedProd.length);
      const score = 1 - (dist / maxLength);

      if (score > highestScore && score >= THRESHOLD) {
        highestScore = score;
        bestMatch = {
          product_id: prod.id,
          name: prod.name,
          confidence: parseFloat(score.toFixed(2))
        };
      }
    }
    return bestMatch;
  },

  normalize(text: string): string {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
  }
};