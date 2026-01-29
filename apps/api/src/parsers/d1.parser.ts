// src/parsers/d1.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem } from './types';

/**
 * Parser para tickets de Tiendas D1
 * 
 * Formatos conocidos:
 * - Header: "D1 SAS NIT900276962-1 Gran contribuyente"
 * - Fecha: "Generacion: 2024-09-11 11:30:07"
 * - Items formato 1: código y descripción en líneas separadas
 * - Items formato 2: todo en una línea
 */
export class D1Parser extends BaseParser {
  readonly key = 'd1';
  readonly storeName = 'Tiendas D1';
  
  readonly nitPatterns = [
    /NIT\s*[:\s]?\s*900\.?276\.?962/i,
    /900276962/,
  ];
  
  readonly identityPatterns = [
    /D1\s+SAS/i,
    /TIENDAS?\s+D1/i,
    /^D1\s/im,
  ];

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // Extraer NIT si está presente
    const nitMatch = text.match(/NIT\s*[:\s]?\s*([\d\.\-]+)/i);
    if (nitMatch) {
      ticket.store.nit = nitMatch[1].replace(/\D/g, '');
    }

    // Extraer dirección (línea con CRA/CALLE, hasta fin de línea)
    const addrMatch = text.match(/(?:CRA?|CARRERA|CL|CALLE)\s*[\d\w\s]+?(?=\n|$)/i);
    if (addrMatch) {
      ticket.store.address = addrMatch[0].trim();
    }

    // Extraer forma de pago
    if (/EFECTIVO/i.test(text)) {
      ticket.payment = { method: 'cash' };
    } else if (/TARJ|CARD|DEBITO|CREDITO/i.test(text)) {
      ticket.payment = { method: 'card' };
      const cardMatch = text.match(/\*+(\d{4})/);
      if (cardMatch) ticket.payment.cardLastDigits = cardMatch[1];
    }

    return ticket;
  }

  private extractItems(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    // Buscar inicio de items (después de header con ITEM/CODIGO)
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^(ITEM|CODIGO)\s+(CANT|DESCRIPCION)/i.test(lines[i])) {
        startIdx = i + 1;
        break;
      }
    }

    // Buscar fin de items (antes de TOTAL)
    let endIdx = lines.length;
    for (let i = startIdx; i < lines.length; i++) {
      if (/^(TOTAL|AJUSTE|VALOR\s*PAGADO|FORMA\s*DE\s*PAGO)/i.test(lines[i])) {
        endIdx = i;
        break;
      }
    }

    const itemLines = lines.slice(startIdx, endIdx);
    
    // Patrones D1
    // Formato 1: "1    1    UN    X    $4,490" seguido de "0770030492938 AVENA TETRA PAK    4,490 A"
    // Formato 2: "0770030464571 QUESO MOZZARELL    9,490 5"
    
    const codeLinePattern = /^(\d{10,14})\s+(.+?)\s+([\d\.,]+)\s*[A-Z0-9]?$/;
    const qtyLinePattern = /^\d+\s+\d+\s+UN\s+X\s+\$?([\d\.,]+)/i;
    const inlinePattern = /^(\d{10,14})?\s*(\d+)\s+UN\s+X\s+\$?([\d\.,]+)\s*$/i;

    let lineNum = startIdx;
    let pendingQty: { qty: number; unitPrice: number } | null = null;

    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i].trim();
      lineNum++;
      
      if (!line || line.length < 3) continue;
      
      // ¿Es línea de cantidad? "1    1    UN    X    $4,490"
      const qtyMatch = line.match(qtyLinePattern);
      if (qtyMatch) {
        pendingQty = {
          qty: 1, // D1 generalmente muestra 1 por línea
          unitPrice: this.parsePrice(qtyMatch[1]),
        };
        continue;
      }

      // ¿Es línea de código + descripción + precio?
      const codeMatch = line.match(codeLinePattern);
      if (codeMatch) {
        const code = codeMatch[1];
        const desc = codeMatch[2];
        const price = this.parsePrice(codeMatch[3]);
        
        // Usar cantidad pendiente si existe
        const qty = pendingQty?.qty || 1;
        const unitPrice = pendingQty?.unitPrice || price;
        
        items.push(this.createItem({
          rawLine: line,
          code,
          description: desc,
          quantity: qty,
          unitPrice: unitPrice,
          totalPrice: price,
          confidence: 0.9,
        }, lineNum));
        
        pendingQty = null;
        continue;
      }

      // Patrón alternativo: descripción con precio al final
      const altPattern = /^(.+?)\s+([\d\.,]+)\s*[A-Z]?$/;
      const altMatch = line.match(altPattern);
      if (altMatch && altMatch[1].length > 3 && !/^\d+$/.test(altMatch[1])) {
        const price = this.parsePrice(altMatch[2]);
        if (price > 100 && price < 1000000) { // Filtro de precios razonables
          items.push(this.createItem({
            rawLine: line,
            description: altMatch[1],
            quantity: 1,
            totalPrice: price,
            confidence: 0.7,
            flags: ['needs_review'],
          }, lineNum));
        }
      }
    }

    return items;
  }
}