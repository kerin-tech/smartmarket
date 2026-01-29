// src/parsers/exito.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem } from './types';

/**
 * Parser para tickets de Almacenes Éxito (incluye Carulla)
 * 
 * Formatos conocidos:
 * - Header: "ALMACENES EXITO S.A NIT 8909006089"
 * - Sucursal: "EXITO SAN FRANCISCO" o "EXITO SAN BLAS"
 * - Items: "PLU DETALLE PRECIO" con formato "1 1/u x 10.950 V.Ahorro 0"
 * - Código y descripción en línea siguiente: "3280456 Queso Mozzarella"
 */
export class ExitoParser extends BaseParser {
  readonly key = 'exito';
  readonly storeName = 'Almacenes Éxito';
  
  readonly nitPatterns = [
    /NIT\s*[:\s]?\s*890\.?900\.?6089/i,
    /8909006089/,
  ];
  
  readonly identityPatterns = [
    /ALMACENES\s+EXITO/i,
    /^EXITO\s+\w+/im,
    /GRUPO\s+EXITO/i,
  ];

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // Extraer nombre de sucursal
    const sucursalMatch = text.match(/EXITO\s+([A-Z\s]+?)(?:\n|COMPRA)/i);
    if (sucursalMatch) {
      ticket.store.name = `Éxito ${this.capitalize(sucursalMatch[1].trim())}`;
    }

    // Extraer NIT
    const nitMatch = text.match(/NIT\s*[:\s]?\s*([\d\.\-]+)/i);
    if (nitMatch) {
      ticket.store.nit = nitMatch[1].replace(/\D/g, '');
    }

    // Extraer descuentos y ahorros
    const descuentoMatch = text.match(/DESCUENTO\s*([\d\.,]+)/i);
    const ahorroMatch = text.match(/AHORRO\s*([\d\.,]+)/i);
    if (descuentoMatch || ahorroMatch) {
      ticket.totals.discount = 
        this.parsePrice(descuentoMatch?.[1] || '0') + 
        this.parsePrice(ahorroMatch?.[1] || '0');
    }

    // Subtotal
    const subtotalMatch = text.match(/SUBTOTAL\s*([\d\.,]+)/i);
    if (subtotalMatch) {
      ticket.totals.subtotal = this.parsePrice(subtotalMatch[1]);
    }

    // Forma de pago
    if (/EFECTIVO/i.test(text)) {
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
    
    // Buscar inicio de items (después de PLU DETALLE)
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^PLU\s+DETALLE/i.test(lines[i])) {
        startIdx = i + 1;
        break;
      }
    }

    // Buscar fin de items
    let endIdx = lines.length;
    for (let i = startIdx; i < lines.length; i++) {
      if (/^(SUBTOTAL|TOTAL\s*ITEM|DISCRIMINACION)/i.test(lines[i])) {
        endIdx = i;
        break;
      }
    }

    const itemLines = lines.slice(startIdx, endIdx);
    
    // Patrones Éxito
    // Línea 1: "1 1/u x 10.950 V.Ahorro 0" (cantidad, unidad, precio, ahorro)
    // Línea 2: "3280456 Queso Mozzarella    10.950A"
    const qtyPattern = /^(\d+)\s+(\d+)\/(\w+)\s+[xX]\s+([\d\.,]+)\s*V\.?Ahorro\s*([\d\.,]+)?/i;
    const productPattern = /^(\d{6,8})\s+(.+?)\s+([\d\.,]+)\s*[A-Z]?$/;
    const simpleProductPattern = /^(\d{6,8})?\s*(.+?)\s+([\d\.,]+)\s*[A-Z]?$/;

    let lineNum = startIdx;
    let pendingQty: { qty: number; unitPrice: number; ahorro: number } | null = null;

    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i].trim();
      lineNum++;
      
      if (!line || line.length < 3) continue;

      // ¿Es línea de cantidad? "1 1/u x 10.950 V.Ahorro 0"
      const qtyMatch = line.match(qtyPattern);
      if (qtyMatch) {
        pendingQty = {
          qty: parseInt(qtyMatch[2], 10),
          unitPrice: this.parsePrice(qtyMatch[4]),
          ahorro: this.parsePrice(qtyMatch[5] || '0'),
        };
        continue;
      }

      // ¿Es línea de producto con código?
      const productMatch = line.match(productPattern);
      if (productMatch) {
        const code = productMatch[1];
        const desc = productMatch[2];
        const totalPrice = this.parsePrice(productMatch[3]);
        
        const qty = pendingQty?.qty || 1;
        const unitPrice = pendingQty?.unitPrice || totalPrice;

        items.push(this.createItem({
          rawLine: line,
          code,
          description: desc,
          quantity: qty,
          unitPrice,
          totalPrice,
          confidence: 0.9,
        }, lineNum));
        
        pendingQty = null;
        continue;
      }

      // Patrón simple sin cantidad previa
      const simpleMatch = line.match(simpleProductPattern);
      if (simpleMatch && simpleMatch[2].length > 3) {
        const desc = simpleMatch[2].trim();
        // Ignorar líneas que parecen totales o headers
        if (/^(total|subtotal|descuento|ahorro|iva)/i.test(desc)) continue;
        
        const price = this.parsePrice(simpleMatch[3]);
        if (price > 100 && price < 5000000) {
          items.push(this.createItem({
            rawLine: line,
            code: simpleMatch[1],
            description: desc,
            quantity: 1,
            totalPrice: price,
            confidence: 0.7,
            flags: pendingQty ? undefined : ['needs_review'],
          }, lineNum));
          pendingQty = null;
        }
      }
    }

    return items;
  }

  private capitalize(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}