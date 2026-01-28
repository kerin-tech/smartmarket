import { ITicketParser, cleanColombianPrice } from './types';
import { TicketLine, ParsedTicket } from '../types/ocr.types';

export class GiganteHogarParser implements ITicketParser {
  readonly storeId = 'GIGANTE_HOGAR';

  canHandle(lines: string[], fullText: string): boolean {
    return /INVERSIONES\s*DUQUIN\s*SAS|GIGANTE\s*DEL\s*HOGAR/i.test(fullText);
  }

  parse(lines: string[], fullText: string): Partial<ParsedTicket> {
    const results: TicketLine[] = [];
    
    // 1. Extraer Fecha (YYYY/M/D)
    const dateMatch = fullText.match(/Fecha\s*:\s*(\d{4}\/\d{1,2}\/\d{1,2})/i);
    let extractedDate: any = undefined; // Usamos any para evitar el conflicto con la interfaz ParsedTicket

    if (dateMatch) {
      const normalizedDate = dateMatch[1].replace(/\//g, '-');
      const d = new Date(normalizedDate);
      if (!isNaN(d.getTime())) {
        extractedDate = d; // Guardamos el objeto Date
      }
    }

    // 2. Patrón de productos UND
    const valuesPattern = /UND\s+(\d+)\s+\$([\d.,]+)\s+\$([\d.,]+)/i;

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(valuesPattern);
      if (match && i > 0) {
        const productName = lines[i - 1].replace(/^\d+\s+/, '').trim();
        results.push({
          productName: productName.toUpperCase(),
          quantity: parseInt(match[1], 10),
          unitPrice: cleanColombianPrice(match[2]),
          totalPrice: cleanColombianPrice(match[3]),
          rawText: `${lines[i-1]} | ${lines[i]}`,
          confidence: 0.98
        });
      }
    }

    const totalMatch = fullText.match(/TOTAL[\s.]+\$([\d.,]+)/i) || 
                       fullText.match(/\$([\d.,]{5,10})(?:\s+9)?$/);

    return {
      storeName: 'EL GIGANTE DEL HOGAR',
      date: extractedDate, // TypeScript ya no debería marcar error aquí
      lines: results,
      total: totalMatch ? cleanColombianPrice(totalMatch[1]) : undefined
    } as Partial<ParsedTicket>; // Forzamos el cast para asegurar compatibilidad
  }
}