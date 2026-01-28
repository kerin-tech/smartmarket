import { ITicketParser, cleanColombianPrice } from './types';
import { TicketLine, ParsedTicket } from '../types/ocr.types';

export class DollarcityParser implements ITicketParser {
  readonly storeId = 'DOLLARCITY';

  canHandle(lines: string[], fullText: string): boolean {
    return /DOLLARCITY|SURAMERICA\s*COMERCIAL/i.test(fullText);
  }

  parse(lines: string[]): Partial<ParsedTicket> {
    const results: TicketLine[] = [];
    
    // Pattern para la línea de cantidad: "1 @ 427.00" o "2 @ 7000.00"
    const qtyLinePattern = /(\d+)\s*@\s*([\d.,]+)/;

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const qtyMatch = currentLine.match(qtyLinePattern);

      // En Dollarcity, si encontramos la línea con '@', el nombre está 2 posiciones atrás
      if (qtyMatch && i >= 2) {
        const productName = lines[i - 2].replace(/^\d+\s+/, '').trim();
        const quantity = parseInt(qtyMatch[1], 10);
        const unitPrice = cleanColombianPrice(qtyMatch[2]);
        
        // El precio total suele estar en la línea intermedia (i-1) al final
        const totalLine = lines[i - 1];
        const totalMatch = totalLine.match(/([\d.,]+)\s+[A-Z]$/);
        const totalPrice = totalMatch ? cleanColombianPrice(totalMatch[1]) : (unitPrice * quantity);

        results.push({
          productName: productName.toUpperCase(),
          quantity,
          unitPrice,
          totalPrice,
          rawText: `${lines[i-2]} | ${currentLine}`,
          confidence: 0.95
        });
      }
    }

    const totalLine = lines.find(l => /^TOTAL/i.test(l));
    const finalTotal = totalLine?.match(/([\d.,]{4,10})/);

    return {
      storeName: 'DOLLARCITY',
      lines: results,
      total: finalTotal ? cleanColombianPrice(finalTotal[0]) : undefined
    };
  }
}