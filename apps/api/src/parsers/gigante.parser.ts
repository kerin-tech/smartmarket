// src/parsers/gigante.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem } from './types';

/**
 * Parser para tickets de Gigante del Hogar
 * 
 * Formatos conocidos:
 * - Header: "INVERSIONES DUQUIN SAS GIGANTE DEL HOGAR"
 * - NIT: "901140179-8"
 * - Items: 
 *   # Descripcion Item U.M Cant. V/r Unj. Total
 *   1 COPA MARGARITA 9OZ CRISTAR
 *   12031689 5444C 484739 UND 1 $21.500  $21.500*
 * - Total: "TOTAL $21,500"
 */
export class GiganteParser extends BaseParser {
  readonly key = 'gigante';
  readonly storeName = 'Gigante del Hogar';
  
  readonly nitPatterns = [
    /NIT\s*[:\s]?\s*901\.?140\.?179/i,
    /901140179/,
  ];
  
  readonly identityPatterns = [
    /GIGANTE\s+DEL\s+HOGAR/i,
    /INVERSIONES\s+DUQUIN/i,
  ];

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // Extraer sucursal
    const sucursalMatch = text.match(/GIGANTE\s+DEL\s+HOGAR\s+([A-Z]+)/i);
    if (sucursalMatch) {
      ticket.store.name = `Gigante del Hogar ${this.capitalize(sucursalMatch[1])}`;
    }

    // Extraer NIT
    const nitMatch = text.match(/(\d{9,10})-?\d?\s+[A-Z]/);
    if (nitMatch) {
      ticket.store.nit = nitMatch[1];
    }

    // Extraer dirección
    const addrMatch = text.match(/CCIAL\s+([A-Z\s]+)\s+CL/i);
    if (addrMatch) {
      ticket.store.address = `C.C. ${this.capitalize(addrMatch[1].trim())}`;
    }

    // Extraer total específico - buscar línea TOTAL seguida de precio
    const totalMatch = text.match(/TOTAL\s*\n\s*\$?([\d\.,]+)/i) 
      || text.match(/TOTAL\s+\$?([\d\.,]+)/i);
    if (totalMatch) {
      ticket.totals.total = this.parsePrice(totalMatch[1]);
      ticket.totals.confidence = 0.95;
    }

    // Extraer fecha - formato "2026/1/11" o "Fecha : 2026/1/11"
    const dateMatch = text.match(/Fecha\s*:\s*(\d{4}\/\d{1,2}\/\d{1,2})/i);
    if (dateMatch) {
      const [y, m, d] = dateMatch[1].split('/');
      ticket.date = {
        value: new Date(parseInt(y), parseInt(m) - 1, parseInt(d)),
        raw: dateMatch[1],
        confidence: 0.95,
      };
    }

    // Forma de pago
    if (/EFECTIVO/i.test(text)) {
      ticket.payment = { method: 'cash' };
    } else if (/MASTER\s*CARD|VISA|DEBITO|CREDITO/i.test(text)) {
      ticket.payment = { method: 'card' };
      const cardMatch = text.match(/\*+(\d{4})/);
      if (cardMatch) ticket.payment.cardLastDigits = cardMatch[1];
    }

    return ticket;
  }

  private extractItems(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    // Buscar inicio de items (después de "# Descripcion" o "Total" como header)
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^#\s*Descripcion/i.test(lines[i]) || /^Descripcion\s*$/i.test(lines[i])) {
        startIdx = i + 1;
        break;
      }
    }

    // Saltar líneas de header (Iten, U.M, Cant, etc)
    while (startIdx < lines.length && /^(Iten|Item|U\.M|U\/M|Cant|V\/r|Total|U\/r)$/i.test(lines[startIdx].trim())) {
      startIdx++;
    }

    // Buscar fin de items (TOTAL solo, sin precio en misma línea)
    let endIdx = lines.length;
    for (let i = startIdx; i < lines.length; i++) {
      if (/^TOTAL\s*$/i.test(lines[i]) || /^TOTAL\s+ITEMS/i.test(lines[i])) {
        endIdx = i;
        break;
      }
    }

    const itemLines = lines.slice(startIdx, endIdx);
    
    // Patrones
    // Descripción: "1 COPA MARGARITA 90Z CRISTAR"
    const descPattern = /^(\d+)\s+([A-Z][A-Z\s\d]+)$/i;
    // Detalle completo: "12031689 5444C 484739 UND 1 $21.500"
    const fullDetailPattern = /^(\d+)\s+\S+\s+\S+\s+(UND|UN|KG|LB)\s+(\d+)\s+\$?([\d\.,]+)/i;
    // Solo código: "12031689 5444C 484739"
    const codeOnlyPattern = /^(\d{6,14})\s+\w+\s+\d+\s*$/;
    // Unidad/cantidad/precio: "UND 1 $21.500"
    const qtyPricePattern = /^(UND|UN|KG|LB)\s+(\d+)\s+\$?([\d\.,]+)/i;
    // Total: "$21.500*"
    const totalLinePattern = /^\$?([\d\.,]+)\*?$/;

    let currentItem: {
      num: number;
      desc: string;
      code?: string;
      unit?: string;
      qty?: number;
      unitPrice?: number;
      rawLines: string[];
    } | null = null;

    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i].trim();
      
      if (!line || line.length < 2) continue;

      // ¿Es línea de descripción? "1 COPA MARGARITA 90Z CRISTAR"
      const descMatch = line.match(descPattern);
      if (descMatch && !/^\d+\s+\d{5,}/.test(line)) {
        // Guardar item anterior si existe
        if (currentItem && currentItem.unitPrice) {
          items.push(this.createItemFromPending(currentItem));
        }
        
        currentItem = {
          num: parseInt(descMatch[1], 10),
          desc: descMatch[2].trim(),
          rawLines: [line],
        };
        continue;
      }

      if (!currentItem) continue;

      // ¿Es línea de detalle completo? "12031689 5444C 484739 UND 1 $21.500"
      const fullMatch = line.match(fullDetailPattern);
      if (fullMatch) {
        currentItem.code = fullMatch[1];
        currentItem.unit = fullMatch[2].toUpperCase();
        currentItem.qty = parseInt(fullMatch[3], 10);
        currentItem.unitPrice = this.parsePrice(fullMatch[4]);
        currentItem.rawLines.push(line);
        continue;
      }

      // ¿Es solo código? "12031689 5444C 484739"
      const codeMatch = line.match(codeOnlyPattern);
      if (codeMatch) {
        currentItem.code = codeMatch[1];
        currentItem.rawLines.push(line);
        continue;
      }

      // ¿Es línea de unidad/cantidad/precio? "UND 1 $21.500"
      const qtyMatch = line.match(qtyPricePattern);
      if (qtyMatch) {
        currentItem.unit = qtyMatch[1].toUpperCase();
        currentItem.qty = parseInt(qtyMatch[2], 10);
        currentItem.unitPrice = this.parsePrice(qtyMatch[3]);
        currentItem.rawLines.push(line);
        continue;
      }

      // ¿Es línea de total? "$21.500*"
      const totalMatch = line.match(totalLinePattern);
      if (totalMatch && currentItem.unitPrice) {
        const totalPrice = this.parsePrice(totalMatch[1]);
        currentItem.rawLines.push(line);
        
        items.push(this.createItem({
          rawLine: currentItem.rawLines.join(' | '),
          code: currentItem.code,
          description: currentItem.desc,
          quantity: currentItem.qty || 1,
          unit: currentItem.unit || 'UN',
          unitPrice: currentItem.unitPrice,
          totalPrice,
          confidence: 0.9,
        }, currentItem.num));
        
        currentItem = null;
      }
    }

    // Si quedó un item pendiente con precio, guardarlo
    if (currentItem && currentItem.unitPrice) {
      items.push(this.createItemFromPending(currentItem));
    }

    return items;
  }

  private createItemFromPending(item: {
    num: number;
    desc: string;
    code?: string;
    unit?: string;
    qty?: number;
    unitPrice?: number;
    rawLines: string[];
  }): ParsedItem {
    const qty = item.qty || 1;
    const unitPrice = item.unitPrice || 0;
    return this.createItem({
      rawLine: item.rawLines.join(' | '),
      code: item.code,
      description: item.desc,
      quantity: qty,
      unit: item.unit || 'UN',
      unitPrice,
      totalPrice: unitPrice * qty,
      confidence: 0.85,
    }, item.num);
  }

  private capitalize(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}