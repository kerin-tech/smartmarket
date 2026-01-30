import OpenAI from "openai";
import prisma from "@/config/database";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Umbrales de confianza
const MATCH_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.4,
  LOW: 0.15, // Bajamos un poco para capturar más candidatos
};

interface ProductMatch {
  product_id: string;
  name: string;
  category: string;
  confidence: number;
  match_level: 'high' | 'medium' | 'low';
}

interface StoreMatch {
  store_id: string;
  name: string;
  location: string;
  confidence: number;
}

export const visionService = {
  async scanAndMatch(userId: string, base64Image: string) {
    const aiData = await this.extractDataFromTicket(base64Image);
    
    if (!aiData) throw new Error("No se pudo extraer información del ticket");

    // Log para debug: ver cuántos productos tiene el usuario
    const totalProducts = await prisma.product.count({ where: { userId } });
    console.log(`📦 Usuario tiene ${totalProducts} productos en BD`);

    // Buscar matches de tienda
    const storeMatches = await this.findStoreMatches(userId, aiData.storeName);

    // Procesar items con matching
    const itemsWithMatch = await Promise.all(
      aiData.items.map(async (item: any) => {
        const matches = await this.findProductMatches(userId, item.productName);
        
        // Log para debug
        console.log(`🔍 "${item.productName}" → ${matches.length} matches encontrados`);
        
        const bestMatch = matches.length > 0 ? matches[0] : null;
        const suggestions = matches.slice(1, 4);

        return {
          raw_text: item.productName.toUpperCase(),
          detected_name: item.productName,
          detected_price: item.unitPrice,
          detected_quantity: item.quantity,
          detected_category: item.category,
          detected_brand: item.brand || "Genérica",
          match: bestMatch,
          suggestions,
          user_decision: bestMatch?.match_level === 'high' ? 'accept_match' : 'pending'
        };
      })
    );

    // Calcular summary
    const summary = {
      total_items: itemsWithMatch.length,
      matched_count: itemsWithMatch.filter(i => i.match?.match_level === 'high').length,
      suggested_count: itemsWithMatch.filter(i => i.match?.match_level === 'medium').length,
      new_products_count: itemsWithMatch.filter(i => !i.match || i.match.match_level === 'low').length,
      detected_total: itemsWithMatch.reduce((sum, i) => sum + (i.detected_price * i.detected_quantity), 0)
    };

    return {
      ticket_id: crypto.randomUUID(),
      detected_date: aiData.date,
      detected_store: aiData.storeName,
      store_matches: storeMatches,
      selected_store: storeMatches.length > 0 && storeMatches[0].confidence >= MATCH_THRESHOLDS.HIGH 
        ? storeMatches[0] 
        : null,
      items: itemsWithMatch,
      summary
    };
  },

  async findStoreMatches(userId: string, storeName: string): Promise<StoreMatch[]> {
    try {
      // Primero verificar cuántas tiendas tiene el usuario
      const totalStores = await prisma.store.count({ where: { userId } });
      console.log(`🏪 Usuario tiene ${totalStores} tiendas en BD`);

      const results = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        location: string;
        similarity: number;
      }>>`
        SELECT 
          id, 
          name,
          location,
          GREATEST(
            similarity(name, ${storeName}),
            similarity(LOWER(name), LOWER(${storeName})),
            word_similarity(${storeName}, name)
          ) as similarity
        FROM stores
        WHERE user_id = ${userId}::uuid
          AND (
            similarity(name, ${storeName}) > ${MATCH_THRESHOLDS.LOW}
            OR similarity(LOWER(name), LOWER(${storeName})) > ${MATCH_THRESHOLDS.LOW}
            OR word_similarity(${storeName}, name) > ${MATCH_THRESHOLDS.LOW}
            OR LOWER(name) LIKE LOWER(${'%' + storeName + '%'})
          )
        ORDER BY similarity DESC
        LIMIT 5
      `;

      console.log(`🏪 Matches para "${storeName}":`, results.length);

      return results.map(r => ({
        store_id: r.id,
        name: r.name,
        location: r.location,
        confidence: parseFloat(Number(r.similarity).toFixed(2))
      }));
    } catch (error) {
      console.error("Error en findStoreMatches:", error);
      return [];
    }
  },

  async findProductMatches(userId: string, productName: string): Promise<ProductMatch[]> {
    try {
      // Limpiar el nombre del producto para mejor matching
      const cleanName = productName
        .toUpperCase()
        .replace(/[^\w\sáéíóúñ]/gi, ' ')  // Quitar caracteres especiales
        .replace(/\s+/g, ' ')              // Normalizar espacios
        .trim();

      // Extraer palabras clave (ignorar palabras muy cortas)
      const keywords = cleanName
        .split(' ')
        .filter(w => w.length > 2)
        .slice(0, 3)  // Máximo 3 palabras clave
        .join(' ');

      console.log(`🔎 Buscando: "${productName}" → keywords: "${keywords}"`);

      // Query mejorada con múltiples estrategias de matching
      const results = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        category: string;
        similarity: number;
      }>>`
        SELECT 
          id, 
          name,
          category,
          GREATEST(
            similarity(name, ${productName}),
            similarity(LOWER(name), LOWER(${productName})),
            similarity(name, ${cleanName}),
            word_similarity(${productName}, name),
            word_similarity(${keywords}, name)
          ) as similarity
        FROM products
        WHERE user_id = ${userId}::uuid
          AND (
            -- Similarity trigram estándar
            similarity(name, ${productName}) > ${MATCH_THRESHOLDS.LOW}
            -- Similarity case-insensitive
            OR similarity(LOWER(name), LOWER(${productName})) > ${MATCH_THRESHOLDS.LOW}
            -- Similarity con nombre limpio
            OR similarity(name, ${cleanName}) > ${MATCH_THRESHOLDS.LOW}
            -- Word similarity (más flexible con palabras)
            OR word_similarity(${productName}, name) > ${MATCH_THRESHOLDS.LOW}
            -- Word similarity con keywords
            OR word_similarity(${keywords}, name) > ${MATCH_THRESHOLDS.LOW}
            -- LIKE para coincidencias parciales
            OR LOWER(name) LIKE LOWER(${'%' + keywords.split(' ')[0] + '%'})
          )
        ORDER BY similarity DESC
        LIMIT 5
      `;

      return results.map(r => {
        const confidence = parseFloat(Number(r.similarity).toFixed(2));
        let match_level: 'high' | 'medium' | 'low';
        
        if (confidence >= MATCH_THRESHOLDS.HIGH) {
          match_level = 'high';
        } else if (confidence >= MATCH_THRESHOLDS.MEDIUM) {
          match_level = 'medium';
        } else {
          match_level = 'low';
        }

        return {
          product_id: r.id,
          name: r.name,
          category: r.category,
          confidence,
          match_level
        };
      });
    } catch (error) {
      console.error("Error en findProductMatches:", error);
      return [];
    }
  },

  async extractDataFromTicket(base64Image: string) {
    const validCategories = [
      'Frutas', 'Verduras', 'Granos', 'Lácteos', 'Carnes', 'Bebidas', 
      'Limpieza', 'Otros', 'Despensa', 'Panadería', 'Pescados', 
      'Huevos', 'Licores', 'Cuidado Personal', 'Mascotas', 'Bebés', 'Congelados'
    ];

   const systemPrompt = `Eres un experto en extracción de datos de tickets/facturas de supermercados colombianos. Analiza con MÁXIMA PRECISIÓN.

## REGLAS CRÍTICAS:

### 1. CATEGORIZACIÓN OBLIGATORIA (REGLA DE ORO)
- **SOLO** puedes usar estas categorías: ${validCategories.join(", ")}
- **PROHIBIDO** crear nuevas categorías, usar sinónimos o dejar el campo vacío.
- Si un producto no encaja perfectamente, asígnalo a la categoría más cercana de la lista anterior. 
- **Bajo ninguna circunstancia** inventes una categoría que no esté en la lista proporcionada.

### 2. NUNCA INVENTAR DATOS
- Si no puedes leer claramente un producto o su precio, OMÍTELO.
- JAMÁS inventes nombres, precios o cantidades.

### 3. NÚMEROS DE LÍNEA vs CANTIDAD
- Los números correlativos al INICIO (1, 2, 3...) son NÚMEROS DE LÍNEA, NO cantidades.
- La CANTIDAD real se identifica por: "UN", "UND", "X", "@", "KGM", "KG".
- Si NO hay indicación clara de cantidad, asume cantidad = 1.

### 4. LÓGICA POR TIENDA
- **DOLLARCITY:** El primer número es índice de línea. Cantidad sigue al "@".
- **D1:** Cantidad precede a "UN".
- **ARA:** Cuidado con "KGM" (pesados). Ignora códigos internos.
- **ÉXITO:** Usa el precio final de la línea. Ignora "V.Ahorro" para el cálculo del unitario.
- **OLÍMPICA:** Ignora las columnas de código de unidad (01, 02...).

### 5. CÁLCULO DE PRECIOS
- El precio en el JSON debe ser el **PRECIO UNITARIO**.
- Si el ticket solo da el total de la línea y la cantidad es > 1, calcula: unitPrice = total / quantity.

### 6. FORMATO DE SALIDA
- Devuelve exclusivamente un JSON válido.
- Cada ítem debe tener el nombre, cantidad, unitPrice y la categoría (seleccionada estrictamente de la lista enviada).`;

    const userPrompt = `Analiza este ticket y extrae los datos en JSON:

{
  "storeName": "nombre exacto de la tienda",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "productName": "nombre limpio sin códigos",
      "quantity": 1,
      "unitPrice": 5000,
      "category": "Categoría válida",
      "brand": "marca o null"
    }
  ]
}

RECUERDA: Los números al inicio de línea NO son cantidades. Busca "UN", "KG", "@" para encontrar la cantidad real.`;

    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      console.log('🤖 Llamando a OpenAI Vision API...');
      const startTime = Date.now();
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { 
                  url: `data:image/jpeg;base64,${cleanBase64}`, 
                  detail: "high" 
                }
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });

      console.log(`✅ OpenAI respondió en ${Date.now() - startTime}ms`);

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error("Error en VisionService:", error);
      throw new Error("Error al extraer datos del ticket");
    }
  }
};