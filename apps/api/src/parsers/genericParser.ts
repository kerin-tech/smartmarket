// src/parsers/genericParser.ts
import { ITicketParser, cleanColombianPrice } from './types';
import { TicketLine, ParsedTicket } from '../types/ocr.types';

export class GenericColombianParser implements ITicketParser {
  readonly storeId = 'GENERIC';

  canHandle() { return true; } // Es el fallback

  parse(lines: string[]): Partial<ParsedTicket> {
    const results: TicketLine[] = [];
    // Patrón: "Nombre del Producto 12.500"
    const linePattern = /^(.+?)\s+\$?([\d.,]{3,10})$/;

    lines.forEach(line => {
      if (this.shouldIgnore(line)) return;
      const match = line.match(linePattern);
      if (match) {
        const price = cleanColombianPrice(match[2]);
        results.push({
          productName: match[1].trim().toUpperCase(),
          quantity: 1,
          totalPrice: price,
          unitPrice: price,
          rawText: line,
          confidence: 0.7
        });
      }
    });
    return { lines: results };
  }

  private shouldIgnore(line: string): boolean {
    return /total|iva|subtotal|pago|cambio|efectivo|tarjeta|nit|tel|fecha/i.test(line);
  }
}