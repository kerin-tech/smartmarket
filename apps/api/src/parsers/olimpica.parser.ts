// src/parsers/olimpica.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem } from './types';

/**
 * Parser para tickets de Olímpica y SAO
 * 
 * Formatos conocidos:
 * - Header: "OLIMPICA CALLE 30..." o "SAO"
 * - NIT: "890.107.487-3"
 * - Items: código en una línea, descripción y precios en la siguiente
 * - Formato: "$ UM Vr. Unit Cant Vr. Total"
 * - Total: "**SUBTOTAL/TOTAL ---> $"
 */
export class OlimpicaParser extends BaseParser {
  readonly key = 'olimpica';
  readonly storeName = 'Olímpica';
  
  readonly nitPatterns = [
    /NIT\.?\s*890\.?107\.?487/i,
    /890107487/,
  ];
  
  readonly identityPatterns = [
    /OLIMPICA/i,
    /\bSAO\b/i,
    /SUPER\s*ALMACENES/i,
  ];

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // Extraer nombre de sucursal
    const sucursalMatch = text.match(/OLIMPICA\s+(.+?)(?:\n|NIT)/i);
    if (sucursalMatch) {
      ticket.store.name = `Olímpica ${this.capitalize(sucursalMatch[1].trim())}`;
    } else if (/\bSAO\b/i.test(text)) {
      ticket.store.name = 'SAO (Super Almacenes Olímpica)';
    }

    // Extraer NIT
    const nitMatch = text.match(/NIT\.?\s*([\d\.\-]+)/i);
    if (nitMatch) {
      ticket.store.nit = nitMatch[1].replace(/\D/g, '');
    }

    // Extraer total específico de Olímpica
    const totalMatch = text.match(/\*+\s*SUBTOTAL\/TOTAL\s*-+>\s*\$?\s*([\d\.,]+)/i);
    if (totalMatch) {
      ticket.totals.total = this.parsePrice(totalMatch[1]);
      ticket.totals.confidence = 0.95;
    }

    // Forma de pago
    if (/EFECTIVO/i.test(text)) {
      ticket.payment = { method: 'cash' };
    } else if (/TARJETA|DEBITO|CREDITO|PLATA/i.test(text)) {
      ticket.payment = { method: 'card' };
      const cardMatch = text.match(/\*+(\d{4})/);
      if (cardMatch) ticket.payment.cardLastDigits = cardMatch[1];
    }

    return ticket;
  }

  private extractItems(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    // Buscar inicio de items (después de header con $ UM Vr.)
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^\$?\s*UM\s+Vr\.?\s*Unit/i.test(lines[i])) {
        startIdx = i + 1;
        break;
      }
    }

    // Buscar fin de items
    let endIdx = lines.length;
    for (let i = startIdx; i < lines.length; i++) {
      if (/(\*+\s*SUBTOTAL|TOTAL\s*ARTICULOS|FORMA\s*DE\s*PAGO)/i.test(lines[i])) {
        endIdx = i;
        break;
      }
    }

    const itemLines = lines.slice(startIdx, endIdx);
    
    // Patrones Olímpica
    // Línea 1: "2154211 LECHE UHT OLIMPICA"
    // Línea 2: "01 un    3.200     1      3.200    *"
    const codePattern = /^(\d{6,8})\s+(.+)$/;
    const priceLinePattern = /^(\d{1,2})\s+(un|kg|lb|gr)\s+([\d\.,]+)\s+(\d+)\s+([\d\.,]+)\s*\*?$/i;
    
    // Patrón alternativo: todo en una línea
    const inlinePattern = /^(\d{6,8})?\s*(.+?)\s+(\d{1,2})\s+(un|kg)\s+([\d\.,]+)\s+(\d+)\s+([\d\.,]+)/i;

    let lineNum = startIdx;
    let pendingProduct: { code: string; description: string; rawLine: string } | null = null;

    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i].trim();
      lineNum++;
      
      if (!line || line.length < 3) continue;

      // ¿Es línea de código + descripción?
      const codeMatch = line.match(codePattern);
      if (codeMatch && !/^\d+\s+(un|kg)/i.test(line)) {
        pendingProduct = {
          code: codeMatch[1],
          description: codeMatch[2],
          rawLine: line,
        };
        continue;
      }

      // ¿Es línea de precios?
      const priceMatch = line.match(priceLinePattern);
      if (priceMatch && pendingProduct) {
        const unit = priceMatch[2].toUpperCase();
        const unitPrice = this.parsePrice(priceMatch[3]);
        const qty = parseInt(priceMatch[4], 10);
        const totalPrice = this.parsePrice(priceMatch[5]);

        items.push(this.createItem({
          rawLine: `${pendingProduct.rawLine} | ${line}`,
          code: pendingProduct.code,
          description: pendingProduct.description,
          quantity: qty,
          unit,
          unitPrice,
          totalPrice,
          confidence: 0.9,
        }, lineNum));
        
        pendingProduct = null;
        continue;
      }

      // Patrón inline (todo en una línea)
      const inlineMatch = line.match(inlinePattern);
      if (inlineMatch) {
        items.push(this.createItem({
          rawLine: line,
          code: inlineMatch[1],
          description: inlineMatch[2].trim(),
          quantity: parseInt(inlineMatch[6], 10),
          unit: inlineMatch[4].toUpperCase(),
          unitPrice: this.parsePrice(inlineMatch[5]),
          totalPrice: this.parsePrice(inlineMatch[7]),
          confidence: 0.85,
        }, lineNum));
        pendingProduct = null;
      }
    }

    return items;
  }

  private capitalize(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}