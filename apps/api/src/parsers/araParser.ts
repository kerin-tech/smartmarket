// src/parsers/araParser.ts
import { ITicketParser, cleanColombianPrice } from './types';
import { TicketLine, ParsedTicket } from '../types/ocr.types';

export class AraParser implements ITicketParser {
  readonly storeId = 'ARA';

  canHandle(lines: string[]): boolean {
    return lines.some(l => /jeronimo\s*martins|^ara$/i.test(l));
  }

  parse(lines: string[]): Partial<ParsedTicket> {
    const valorIndex = lines.findIndex(l => l.trim().toLowerCase() === 'valor');
    if (valorIndex === -1) return {};

    const productZone = lines.slice(0, valorIndex);
    const priceZone = lines.slice(valorIndex + 1);
    const results: TicketLine[] = [];

    // Lógica simplificada de tu código original
    const productLinePattern = /^[\d\s]{6,}\s+(.+)$/;
    
    let priceIdx = 0;
    productZone.forEach((line) => {
      const match = line.match(productLinePattern);
      if (match && priceZone[priceIdx]) {
        const price = cleanColombianPrice(priceZone[priceIdx]);
        results.push({
          productName: match[1].trim().toUpperCase(),
          quantity: 1, 
          totalPrice: price,
          unitPrice: price,
          rawText: line,
          confidence: 0.9
        });
        priceIdx++;
      }
    });

    return { storeName: 'ARA', lines: results };
  }
}