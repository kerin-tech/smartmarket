// src/parsers/generic.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem, DetectionResult } from './types';

/**
 * Parser genérico de fallback
 * Usa heurísticas para extraer datos de tickets desconocidos
 */
export class GenericParser extends BaseParser {
  readonly key = 'generic';
  readonly storeName = 'Tienda Desconocida';
  readonly nitPatterns: RegExp[] = [];
  readonly identityPatterns: RegExp[] = [];

  /**
   * Siempre puede parsear (es el fallback)
   */
  canParse(text: string): DetectionResult | null {
    return {
      storeKey: this.key,
      storeName: this.storeName,
      confidence: 0.1, // Muy baja para que otros parsers tengan prioridad
      matchedPatterns: ['fallback'],
    };
  }

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // Intentar detectar nombre de tienda
    const storeName = this.guessStoreName(lines);
    if (storeName) {
      ticket.store.name = storeName;
      ticket.store.confidence = 0.5;
    }

    ticket.meta.warnings.push('Parser genérico usado - revisar datos');
    
    return ticket;
  }

  private extractItems(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    // Patrones comunes de ítems
    const patterns = [
      // "2 x PRODUCTO    $4.500"
      /^(\d+)\s*[xX]\s+(.+?)\s+\$?([\d\.,]+)$/,
      // "PRODUCTO    2    4500    9000"
      /^(.+?)\s+(\d+)\s+([\d\.,]+)\s+([\d\.,]+)$/,
      // "PRODUCTO    $4.500"
      /^(.+?)\s+\$?([\d\.,]+)$/,
    ];

    // Palabras a ignorar (headers, totales, etc)
    const ignoreWords = /^(nit|tel|dir|fecha|hora|factura|recibo|iva|subtotal|total|efectivo|cambio|gracias|cliente|consumidor)/i;
    const ignoreLine = (l: string) => {
      if (l.length < 4) return true;
      if (ignoreWords.test(l)) return true;
      if (/^[\-=\*]+$/.test(l)) return true;
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(l)) return true;
      return false;
    };

    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      if (ignoreLine(line)) continue;

      // Patrón 1: cantidad x producto precio
      const m1 = line.match(patterns[0]);
      if (m1) {
        items.push(this.createItem({
          rawLine: line,
          description: m1[2],
          quantity: parseInt(m1[1], 10),
          totalPrice: this.parsePrice(m1[3]),
          confidence: 0.7,
        }, lineNum));
        continue;
      }

      // Patrón 2: producto cant unit total
      const m2 = line.match(patterns[1]);
      if (m2 && m2[1].length > 2 && !/^\d+$/.test(m2[1])) {
        items.push(this.createItem({
          rawLine: line,
          description: m2[1],
          quantity: parseInt(m2[2], 10),
          unitPrice: this.parsePrice(m2[3]),
          totalPrice: this.parsePrice(m2[4]),
          confidence: 0.8,
        }, lineNum));
        continue;
      }

      // Patrón 3: producto precio (más permisivo)
      const m3 = line.match(patterns[2]);
      if (m3 && m3[1].length > 3 && !/^\d+$/.test(m3[1])) {
        const price = this.parsePrice(m3[2]);
        if (price > 0 && price < 10000000) {
          items.push(this.createItem({
            rawLine: line,
            description: m3[1],
            totalPrice: price,
            confidence: 0.5,
            flags: ['needs_review'],
          }, lineNum));
        }
      }
    }

    return items;
  }

  private guessStoreName(lines: string[]): string | null {
    // Buscar en las primeras 5 líneas algo que parezca nombre de tienda
    const storeHints = [
      { re: /exito/i, name: 'Éxito' },
      { re: /olimpica/i, name: 'Olímpica' },
      { re: /d1\b/i, name: 'D1' },
      { re: /ara\b/i, name: 'ARA' },
      { re: /jumbo/i, name: 'Jumbo' },
      { re: /carulla/i, name: 'Carulla' },
      { re: /dollarcity/i, name: 'Dollarcity' },
      { re: /metro/i, name: 'Metro' },
      { re: /isimo/i, name: 'Ísimo' },
    ];

    for (const line of lines.slice(0, 8)) {
      for (const { re, name } of storeHints) {
        if (re.test(line)) return name;
      }
    }

    return null;
  }
}