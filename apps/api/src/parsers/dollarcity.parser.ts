// src/parsers/dollarcity.parser.ts

import { BaseParser } from './base.parser';
import { ParsedTicket, ParsedItem } from './types';

/**
 * Parser para tickets de Dollarcity
 * 
 * Formatos conocidos:
 * - Header: "Dollarcity" con logo distintivo
 * - NIT: "9009432434"
 * - Items numerados en múltiples líneas:
 *   1   BOLSA RECICLADA
 *       1112
 *       1 @ 427.00                    427.00 B
 * - Total: "TOTAL                 COP 78000.00"
 */
export class DollarcityParser extends BaseParser {
  readonly key = 'dollarcity';
  readonly storeName = 'Dollarcity';
  
  readonly nitPatterns = [
    /NIT\s*[:\s]?\s*900\.?943\.?2434/i,
    /9009432434/,
  ];
  
  readonly identityPatterns = [
    /Dollarcity/i,
    /SURAMERICA\s*COMERCIAL/i,
  ];

  parse(text: string): ParsedTicket {
    const lines = this.getLines(text);
    const items = this.extractItems(lines);
    const ticket = this.createTicketBase(text, items, lines);
    
    // Extraer nombre de sucursal
    const sucursalMatch = text.match(/DOLLARCITY\s+([A-Z]+)/i);
    if (sucursalMatch) {
      ticket.store.name = `Dollarcity ${this.capitalize(sucursalMatch[1])}`;
    }

    // Extraer NIT
    const nitMatch = text.match(/NIT\s*[:\s]?\s*([\d\.\-]+)/i);
    if (nitMatch) {
      ticket.store.nit = nitMatch[1].replace(/\D/g, '');
    }

    // Extraer total específico Dollarcity (COP)
    // Formato: "COP 78000.00" - convertir a entero
    const totalMatch = text.match(/COP\s*([\d]+)(?:\.00)?/i);
    if (totalMatch) {
      ticket.totals.total = parseInt(totalMatch[1], 10);
      ticket.totals.confidence = 0.95;
    }

    // Forma de pago
    if (/EFECTIVO/i.test(text)) {
      ticket.payment = { method: 'cash' };
    } else if (/MASTERCARD|VISA|DEBITO|CREDITO/i.test(text)) {
      ticket.payment = { method: 'card' };
      const cardMatch = text.match(/\*+(\d{4})/);
      if (cardMatch) ticket.payment.cardLastDigits = cardMatch[1];
    }

    return ticket;
  }

  private extractItems(lines: string[]): ParsedItem[] {
    const items: ParsedItem[] = [];
    
    // El OCR de Dollarcity viene MUY desordenado
    // Estrategia: extraer por patrones específicos y emparejar
    
    // 1. Encontrar items numerados: "1 BOLSA RECICLADA", "10 PANOS ROJO..."
    const itemPattern = /^(\d{1,2})\s+([A-Z][A-Z\s\/\d\.]+)$/i;
    
    // 2. Encontrar precios con letra al final: "427.00 B", "5000.00 B"
    const priceWithLetterPattern = /^(\d+(?:\.\d{2})?)\s*([BZEP])$/;
    
    // 3. Encontrar cantidad @ precio: "1 @ 427.00", "2 @ 7000.00"
    const qtyPattern = /^(\d+)\s*@\s*([\d\.]+)$/;
    
    // 4. Códigos de barras
    const barcodePattern = /^(\d{12,14})$/;
    
    // Recolectar datos
    const itemDescriptions: { num: number; desc: string; line: string }[] = [];
    const prices: number[] = [];
    const quantities: { qty: number; unit: number }[] = [];
    const barcodes: string[] = [];
    
    // Items a ignorar
    const ignoreItems = ['impuesto bolsa plastica', 'bolsa plastica'];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Item numerado
      const itemMatch = trimmed.match(itemPattern);
      if (itemMatch) {
        const num = parseInt(itemMatch[1], 10);
        const desc = itemMatch[2].trim();
        // Ignorar si es muy corto o solo números
        if (desc.length > 2 && !/^\d+$/.test(desc)) {
          // Ignorar impuesto bolsa
          if (!ignoreItems.some(ig => desc.toLowerCase().includes(ig))) {
            itemDescriptions.push({ num, desc, line: trimmed });
          }
        }
        continue;
      }
      
      // Precio con letra (ej: "427.00 B")
      const priceMatch = trimmed.match(priceWithLetterPattern);
      if (priceMatch) {
        // Convertir "427.00" a 427 (centavos son .00)
        const price = Math.round(parseFloat(priceMatch[1]));
        if (price > 0 && price < 1000000) {
          prices.push(price);
        }
        continue;
      }
      
      // Cantidad @ precio
      const qtyMatch = trimmed.match(qtyPattern);
      if (qtyMatch) {
        quantities.push({
          qty: parseInt(qtyMatch[1], 10),
          unit: Math.round(parseFloat(qtyMatch[2])),
        });
        continue;
      }
      
      // Código de barras
      const barcodeMatch = trimmed.match(barcodePattern);
      if (barcodeMatch) {
        barcodes.push(barcodeMatch[1]);
        continue;
      }
    }
    
    // Ordenar items por número
    itemDescriptions.sort((a, b) => a.num - b.num);
    
    // Emparejar items con precios (asumiendo mismo orden)
    const numItems = Math.min(itemDescriptions.length, prices.length);
    
    for (let i = 0; i < numItems; i++) {
      const { num, desc, line } = itemDescriptions[i];
      const totalPrice = prices[i];
      const qtyInfo = quantities[i] || { qty: 1, unit: totalPrice };
      const code = barcodes[i];
      
      items.push(this.createItem({
        rawLine: line,
        code,
        description: desc,
        quantity: qtyInfo.qty,
        unitPrice: qtyInfo.unit,
        totalPrice,
        confidence: 0.75,
        flags: ['ocr_unordered'],
      }, num));
    }
    
    return items;
  }

  private cleanDescription(desc: string): string {
    return desc
      .replace(/\s+/g, ' ')
      .replace(/\d{10,14}/, '') // Remover código de barras si quedó
      .trim()
      .toUpperCase();
  }

  private capitalize(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}