// src/parsers/ara.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem } from './types';

/**
 * Parser para tickets de Tiendas ARA (Jerónimo Martins)
 * 
 * Formato especial: columnas separadas
 * - Productos a la izquierda con código
 * - Precios a la derecha después de "Valor"
 * - Cantidades debajo del producto: "2 UN X 3 450" o "0,735 KGM X 9 600"
 */
export class AraParser extends BaseParser {
  readonly key = 'ara';
  readonly storeName = 'Tiendas ARA';
  
  readonly nitPatterns = [
    /NIT\s*[:\s]?\s*900\.?480\.?569/i,
    /900480569/,
  ];
  
  readonly identityPatterns = [
    /JERONIMO\s*MARTINS/i,
    /\bARA\b/i,
    /TIENDAS\s*ARA/i,
  ];

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // ARA / Jerónimo Martins
    if (/JERONIMO\s*MARTINS/i.test(text)) {
      ticket.store.name = 'ARA (Jerónimo Martins)';
    }

    // Extraer NIT
    const nitMatch = text.match(/NIT\s*[:\s]?\s*([\d\.\-]+)/i);
    if (nitMatch) {
      ticket.store.nit = nitMatch[1].replace(/\D/g, '');
    }

    // Forma de pago
    if (/EFECTIVO|CONTADO/i.test(text)) {
      ticket.payment = { method: 'cash' };
    } else if (/TARJETA|DEBITO|CREDITO/i.test(text)) {
      ticket.payment = { method: 'card' };
      const cardMatch = text.match(/\*+(\d{4})/);
      if (cardMatch) ticket.payment.cardLastDigits = cardMatch[1];
    }

    return ticket;
  }

  private extractItems(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    // Detectar si es formato de columnas (ARA)
    // Buscar "Valor" que separa productos de precios
    const valorIndex = lines.findIndex(l => /^valor$/i.test(l.trim()));
    
    if (valorIndex > 0) {
      return this.parseColumnFormat(lines, valorIndex);
    }
    
    // Fallback a formato estándar
    return this.parseStandardFormat(lines);
  }

  /**
   * Parser para formato ARA con columnas separadas
   */
  private parseColumnFormat(lines: string[], valorIndex: number): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    const productZone = lines.slice(0, valorIndex);
    const priceZone = lines.slice(valorIndex + 1);
    
    // Patrones
    const productLinePattern = /^(\d{6,14})\s+(.+)$/;
    const quantityPattern = /^(\d+)\s*(UN|EA)\s*X\s*([\d\s]+)?$/i;
    const weightPattern = /^0?[,.]?\s*(\d{1,3})\s*KGM?\s*X\s*([\d\s]+)?$/i;
    const pricePattern = /^([\d\s]+)\s*[A-Z]?$/;
    
    // Ignorar estas líneas
    const ignorePattern = /^(nit|tel|comprobante|art[ií]culo|descripci[oó]n|jeronimo|total|descuento|tarjeta)/i;

    // Extraer productos
    interface ProductData {
      code: string;
      name: string;
      rawLine: string;
      quantity: number;
      unitPrice: number | null;
    }
    
    const products: ProductData[] = [];
    
    for (let i = 0; i < productZone.length; i++) {
      const line = productZone[i].trim();
      
      if (line.length < 4 || ignorePattern.test(line)) continue;
      if (/^[\-=\*]+$/.test(line)) continue;
      
      const productMatch = line.match(productLinePattern);
      if (productMatch) {
        const code = productMatch[1];
        const name = productMatch[2].trim();
        
        let quantity = 1;
        let unitPrice: number | null = null;
        
        // Revisar siguiente línea por cantidad
        if (i + 1 < productZone.length) {
          const nextLine = productZone[i + 1].trim();
          
          const qtyMatch = nextLine.match(quantityPattern);
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1], 10);
            if (qtyMatch[3]) {
              unitPrice = parseInt(qtyMatch[3].replace(/\s/g, ''), 10);
            }
            i++;
          } else {
            const weightMatch = nextLine.match(weightPattern);
            if (weightMatch) {
              quantity = parseFloat('0.' + weightMatch[1]);
              if (weightMatch[2]) {
                unitPrice = parseInt(weightMatch[2].replace(/\s/g, ''), 10);
              }
              i++;
            }
          }
        }
        
        products.push({ code, name, rawLine: line, quantity, unitPrice });
      }
    }
    
    // Extraer precios
    const prices: number[] = [];
    for (const line of priceZone) {
      const trimmed = line.trim();
      const match = trimmed.match(pricePattern);
      if (match && match[1]) {
        const price = parseInt(match[1].replace(/\s/g, ''), 10);
        if (price > 0 && price < 10000000) {
          prices.push(price);
        }
      }
    }
    
    // Emparejar productos con precios
    const maxItems = Math.min(products.length, prices.length);
    
    for (let i = 0; i < maxItems; i++) {
      const product = products[i];
      const totalPrice = prices[i];
      
      let unitPrice = product.unitPrice;
      if (!unitPrice && product.quantity !== 1) {
        unitPrice = Math.round(totalPrice / product.quantity);
      } else if (!unitPrice) {
        unitPrice = totalPrice;
      }
      
      items.push(this.createItem({
        rawLine: product.rawLine,
        code: product.code,
        description: product.name,
        quantity: product.quantity,
        unitPrice,
        totalPrice,
        confidence: 0.85,
      }, i + 1));
    }
    
    return items;
  }

  /**
   * Fallback para formato estándar
   */
  private parseStandardFormat(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    const pattern = /^(\d{6,14})?\s*(.+?)\s+([\d\.,]+)\s*[A-Z]?$/;
    
    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      const match = line.match(pattern);
      if (match && match[2].length > 3) {
        const price = this.parsePrice(match[3]);
        if (price > 100 && price < 5000000) {
          items.push(this.createItem({
            rawLine: line,
            code: match[1],
            description: match[2],
            quantity: 1,
            totalPrice: price,
            confidence: 0.6,
            flags: ['needs_review'],
          }, lineNum));
        }
      }
    }
    
    return items;
  }
}