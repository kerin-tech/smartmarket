import { ITicketParser, cleanColombianPrice } from './types';
import { TicketLine, ParsedTicket } from '../types/ocr.types';

export class D1Parser implements ITicketParser {
  readonly storeId = 'D1';

  canHandle(lines: string[]): boolean {
    return lines.some(l => /KOBA\s*COLOMBIA|TIENDAS\s*D1/i.test(l));
  }

  parse(lines: string[]): Partial<ParsedTicket> {
    const results: TicketLine[] = [];
    const d1LinePattern = /^(\d+)\s+(.+?)\s+([\d.,]{3,10})$/;

    lines.forEach(line => {
      if (/TOTAL|IVA|ARTICULOS|CAMBIO/i.test(line)) return;

      const match = line.match(d1LinePattern);
      if (match && match[1] && match[3]) {
        const qty = parseInt(match[1], 10);
        const total = cleanColombianPrice(match[3]);
        results.push({
          productName: match[2].trim().toUpperCase(),
          quantity: qty,
          totalPrice: total,
          unitPrice: Math.round(total / qty),
          rawText: line,
          confidence: 0.9
        });
      }
    });

    let finalTotal: number | undefined;
    const totalLine = lines.find(l => /TOTAL\s*A\s*PAGAR/i.test(l));
    
    if (totalLine) {
      const match = totalLine.match(/([\d.,]{4,10})/);
      if (match && match[0]) { // Verificación de seguridad
        finalTotal = cleanColombianPrice(match[0]);
      }
    }

    return { storeName: 'D1', lines: results, total: finalTotal };
  }
}