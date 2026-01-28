// src/services/ocrService.ts

import vision from '@google-cloud/vision';
import path from 'path';
import { preprocessImage, validateImage } from '../utils/image-processor';
import {
  OcrResult,
  ParsedTicket,
  TicketLine,
  OcrServiceResponse,
} from '../types/ocr.types';

// Ruta absoluta al archivo de credenciales
const credentialsPath = path.resolve(__dirname, '../config/google-credentials.json');

// Cliente de Google Cloud Vision
const client = new vision.ImageAnnotatorClient({
  keyFilename: credentialsPath,
});

/**
 * Extrae texto de una imagen usando Google Cloud Vision
 */
async function extractTextFromImage(imageBuffer: Buffer): Promise<OcrResult> {
  const [result] = await client.textDetection({
    image: { content: imageBuffer.toString('base64') },
  });

  const detections = result.textAnnotations || [];
  
  if (detections.length === 0) {
    return { fullText: '', blocks: [], lines: [] };
  }

  // El primer elemento contiene todo el texto
  const fullText = detections[0].description || '';
  
  // Los siguientes elementos son palabras individuales con posición
  const blocks = detections.slice(1).map((d) => ({
    text: d.description || '',
    confidence: d.confidence || 0,
    boundingBox: d.boundingPoly?.vertices?.[0]
      ? {
          x: d.boundingPoly.vertices[0].x || 0,
          y: d.boundingPoly.vertices[0].y || 0,
          width: (d.boundingPoly.vertices[2]?.x || 0) - (d.boundingPoly.vertices[0]?.x || 0),
          height: (d.boundingPoly.vertices[2]?.y || 0) - (d.boundingPoly.vertices[0]?.y || 0),
        }
      : undefined,
  }));

  // Separar por líneas
  const lines = fullText.split('\n').filter((line) => line.trim() !== '');

  return { fullText, blocks, lines };
}

/**
 * Parsea las líneas del ticket detectando formato de columnas (ARA, D1, etc.)
 */
function parseTicketLines(lines: string[]): TicketLine[] {
  const results: TicketLine[] = [];
  
  // Detectar si es formato de columnas (ARA/Jerónimo Martins)
  // Buscar patrón: productos con código a la izquierda, precios separados después de "Valor"
  const valorIndex = lines.findIndex(l => l.trim().toLowerCase() === 'valor');
  
  if (valorIndex > 0) {
    // Formato ARA: columnas separadas
    return parseAraFormat(lines, valorIndex);
  }
  
  // Formato estándar: producto y precio en la misma línea
  for (const line of lines) {
    const parsed = parseStandardLine(line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
}

/**
 * Parser específico para formato ARA (Jerónimo Martins)
 * Maneja el formato donde:
 * - Productos y precios están en columnas separadas
 * - Algunas líneas tienen cantidad/precio unitario debajo del producto
 */
function parseAraFormat(lines: string[], valorIndex: number): TicketLine[] {
  const results: TicketLine[] = [];
  
  // Separar zona de productos y zona de precios
  const productZone = lines.slice(0, valorIndex);
  const priceZone = lines.slice(valorIndex + 1);
  
  // Patrones
  const productLinePattern = /^[\d\s]{6,}\s+[A-Z]/; // Línea que empieza con código
  const quantityLinePattern = /^\s*(\d+)\s*(UN|EA)\s*X\s*([\d\s]+)?$/i; // "2 UN X 3 450"
  const weightLinePattern = /^\s*0?[,.]?\s*(\d{1,3})\s*KGM?\s*X\s*([\d\s]+)?$/i; // "0.735 KGM X 9 600"
  const pricePattern = /^([\d\s]+)\s*[A-Z]?$/; // "6 900 E"
  
  // Patrones a ignorar
  const ignorePatterns = [
    /^(nit|tel|comprobante|art[ií]culo|descripci[oó]n|jeronimo|total|descuento|tarjeta|impoconsumo|trackid)/i,
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
    /^[\-=\*]+$/,
    /^\d{1,3}$/,  // Solo números cortos
  ];
  
  const shouldIgnore = (line: string): boolean => {
    const trimmed = line.trim();
    if (trimmed.length < 4) return true;
    return ignorePatterns.some(p => p.test(trimmed));
  };
  
  // Extraer productos con sus cantidades
  interface ProductData {
    name: string;
    rawLine: string;
    quantity: number;
    unitPrice: number | null;
  }
  
  const products: ProductData[] = [];
  
  for (let i = 0; i < productZone.length; i++) {
    const line = productZone[i].trim();
    
    if (shouldIgnore(line)) continue;
    
    // ¿Es una línea de producto (empieza con código)?
    if (productLinePattern.test(line)) {
      // Extraer nombre del producto
      const nameMatch = line.match(/^[\d\s]+\s+(.+)$/);
      const productName = nameMatch ? nameMatch[1].trim() : line;
      
      // Buscar si la siguiente línea tiene cantidad
      let quantity = 1;
      let unitPrice: number | null = null;
      
      if (i + 1 < productZone.length) {
        const nextLine = productZone[i + 1].trim();
        
        // Verificar si es línea de cantidad en unidades (ej: "2 UN X 3 450")
        const qtyMatch = nextLine.match(quantityLinePattern);
        if (qtyMatch) {
          quantity = parseInt(qtyMatch[1], 10);
          if (qtyMatch[3]) {
            unitPrice = parseInt(qtyMatch[3].replace(/\s/g, ''), 10);
          }
          i++; // Saltar la línea de cantidad
        } else {
          // Verificar si es línea de peso (ej: "0,735 KGM X 9 600")
          const weightMatch = nextLine.match(weightLinePattern);
          if (weightMatch) {
            // Convertir a decimal (ej: "735" -> 0.735)
            const decimalPart = weightMatch[1];
            quantity = parseFloat('0.' + decimalPart);
            if (weightMatch[2]) {
              unitPrice = parseInt(weightMatch[2].replace(/\s/g, ''), 10);
            }
            i++; // Saltar la línea de peso
          }
        }
      }
      
      products.push({
        name: productName,
        rawLine: line,
        quantity,
        unitPrice,
      });
    }
  }
  
  // Extraer precios
  const prices: number[] = [];
  for (const line of priceZone) {
    const trimmed = line.trim();
    const match = trimmed.match(pricePattern);
    if (match && match[1]) {
      const priceStr = match[1].replace(/\s/g, '');
      const price = parseInt(priceStr, 10);
      if (price > 0 && price < 10000000) { // Filtrar valores absurdos
        prices.push(price);
      }
    }
  }
  
  // Emparejar productos con precios
  const maxItems = Math.min(products.length, prices.length);
  
  for (let i = 0; i < maxItems; i++) {
    const product = products[i];
    const totalPrice = prices[i];
    
    // Calcular precio unitario si no lo tenemos
    let unitPrice = product.unitPrice;
    if (!unitPrice && product.quantity !== 1) {
      unitPrice = Math.round(totalPrice / product.quantity);
    } else if (!unitPrice) {
      unitPrice = totalPrice;
    }
    
    results.push({
      rawText: `${product.rawLine} | Qty: ${product.quantity} | Total: ${totalPrice}`,
      productName: cleanProductName(product.name),
      quantity: product.quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      confidence: 0.85,
    });
  }
  
  return results;
}

/**
 * Parser para formato estándar (producto y precio en misma línea)
 */
function parseStandardLine(line: string): TicketLine | null {
  const trimmed = line.trim();
  
  if (trimmed.length < 3) return null;
  
  const ignorePatterns = [
    /^(nit|tel|dir|fecha|hora|factura|recibo|iva|subtotal|total|efectivo|cambio|gracias)/i,
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
    /^\d{1,2}:\d{2}/,
    /^[\-=\*]+$/,
  ];
  
  for (const pattern of ignorePatterns) {
    if (pattern.test(trimmed)) return null;
  }

  // Patrón 1: "CANTIDAD x PRODUCTO    PRECIO"
  const pattern1 = /^(\d+)\s*[xX]\s+(.+?)\s+\$?([\d.,]+)$/;
  const match1 = trimmed.match(pattern1);
  if (match1) {
    return {
      rawText: trimmed,
      quantity: parseInt(match1[1], 10),
      productName: cleanProductName(match1[2]),
      totalPrice: parsePrice(match1[3]),
      unitPrice: null,
      confidence: 0.8,
    };
  }

  // Patrón 2: "PRODUCTO    CANTIDAD    PRECIO_UNIT    TOTAL"
  const pattern2 = /^(.+?)\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)$/;
  const match2 = trimmed.match(pattern2);
  if (match2) {
    return {
      rawText: trimmed,
      productName: cleanProductName(match2[1]),
      quantity: parseInt(match2[2], 10),
      unitPrice: parsePrice(match2[3]),
      totalPrice: parsePrice(match2[4]),
      confidence: 0.9,
    };
  }

  // Patrón 3: "PRODUCTO    $PRECIO"
  const pattern3 = /^(.+?)\s+\$?([\d.,]+)$/;
  const match3 = trimmed.match(pattern3);
  if (match3 && match3[1].length > 2) {
    const productName = cleanProductName(match3[1]);
    if (!/^\d+$/.test(productName)) {
      return {
        rawText: trimmed,
        productName,
        quantity: 1,
        unitPrice: parsePrice(match3[2]),
        totalPrice: parsePrice(match3[2]),
        confidence: 0.7,
      };
    }
  }

  return null;
}

/**
 * Limpia el nombre del producto
 */
function cleanProductName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')           // Múltiples espacios a uno
    .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ]/g, '') // Solo letras, números y espacios
    .toUpperCase();
}

/**
 * Parsea un precio en formato colombiano
 * "4.500" -> 4500
 * "4,500" -> 4500
 * "4500"  -> 4500
 */
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Extrae la fecha del ticket si está presente
 */
function extractDate(lines: string[]): string | null {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // DD/MM/YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,   // DD/MM/YY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,   // YYYY-MM-DD
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        // Normalizar a YYYY-MM-DD
        if (match[3].length === 4) {
          return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        } else if (match[1].length === 4) {
          return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        } else {
          const year = parseInt(match[3], 10) > 50 ? `19${match[3]}` : `20${match[3]}`;
          return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        }
      }
    }
  }
  return null;
}

/**
 * Extrae el total del ticket
 */
function extractTotal(lines: string[]): number | null {
  const totalPatterns = [
    /total[:\s]+\$?([\d.,]+)/i,
    /total\s*a\s*pagar[:\s]+\$?([\d.,]+)/i,
  ];

  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        return parsePrice(match[1]);
      }
    }
  }
  return null;
}

/**
 * Parsea un ticket completo
 */
function parseTicket(ocrResult: OcrResult): ParsedTicket {
  const { lines, fullText } = ocrResult;
  
  // Detectar tienda
  const storeName = detectStoreName(lines);
  
  // Parsear líneas con el formato adecuado
  const ticketLines = parseTicketLines(lines);

  return {
    storeName,
    date: extractDate(lines),
    lines: ticketLines,
    subtotal: null,
    tax: null,
    total: extractTotal(lines),
    rawText: fullText,
  };
}

/**
 * Detecta el nombre de la tienda
 */
function detectStoreName(lines: string[]): string | null {
  const storePatterns: { pattern: RegExp; name: string }[] = [
    { pattern: /jeronimo\s*martins|^ara$/i, name: 'ARA' },
    { pattern: /almacenes\s*[eé]xito|^[eé]xito$/i, name: 'Éxito' },
    { pattern: /olimpica|^olim/i, name: 'Olímpica' },
    { pattern: /d1|d\s*1/i, name: 'D1' },
    { pattern: /jumbo/i, name: 'Jumbo' },
    { pattern: /carulla/i, name: 'Carulla' },
    { pattern: /metro/i, name: 'Metro' },
  ];
  
  for (const line of lines.slice(0, 10)) { // Solo revisar primeras líneas
    for (const { pattern, name } of storePatterns) {
      if (pattern.test(line)) {
        return name;
      }
    }
  }
  
  return null;
}

/**
 * Procesa una imagen de ticket completa
 */
export async function processTicketImage(
  imageBuffer: Buffer
): Promise<OcrServiceResponse> {
  const startTime = Date.now();

  try {
    // Validar imagen
    const validation = await validateImage(imageBuffer);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Preprocesar imagen
    const processedImage = await preprocessImage(imageBuffer);

    // Extraer texto con OCR
    const ocrResult = await extractTextFromImage(processedImage);

    if (!ocrResult.fullText) {
      return {
        success: false,
        error: 'No se pudo detectar texto en la imagen',
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Parsear ticket
    const parsedTicket = parseTicket(ocrResult);

    return {
      success: true,
      data: parsedTicket,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return {
      success: false,
      error: `Error procesando imagen: ${message}`,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Test de conexión con Google Cloud Vision
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🔍 Verificando credenciales...');
    console.log('📁 Ruta credenciales:', credentialsPath);
    
    // Verificar que el archivo existe
    const fs = await import('fs');
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ Archivo de credenciales NO encontrado en:', credentialsPath);
      return false;
    }
    console.log('✅ Archivo de credenciales encontrado');

    // Crear imagen mínima de prueba (1x1 pixel)
    const testBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    console.log('🚀 Enviando petición a Google Cloud Vision...');
    await client.textDetection({ image: { content: testBuffer.toString('base64') } });
    console.log('✅ Conexión exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}