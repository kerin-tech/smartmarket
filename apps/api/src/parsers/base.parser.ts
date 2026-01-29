// src/parsers/base.parser.ts

import {
  ITicketParser,
  ParsedTicket,
  ParsedItem,
  DetectionResult,
} from './types';

/**
 * Clase base abstracta con helpers comunes para todos los parsers
 */
export abstract class BaseParser implements ITicketParser {
  abstract readonly key: string;
  abstract readonly storeName: string;
  abstract readonly nitPatterns: RegExp[];
  abstract readonly identityPatterns: RegExp[];

  /**
   * Evalúa si este parser puede procesar el texto
   */
  canParse(text: string): DetectionResult | null {
    const normalized = this.normalize(text);
    const matched: string[] = [];
    let score = 0;

    // Buscar NIT (peso alto)
    for (const p of this.nitPatterns) {
      if (p.test(normalized)) {
        matched.push(`nit:${p.source}`);
        score += 0.6;
        break;
      }
    }

    // Buscar patrones de identidad (nombre, headers)
    for (const p of this.identityPatterns) {
      if (p.test(normalized)) {
        matched.push(`id:${p.source}`);
        score += 0.3;
      }
    }

    if (matched.length === 0) return null;

    return {
      storeKey: this.key,
      storeName: this.storeName,
      confidence: Math.min(score, 1),
      matchedPatterns: matched,
    };
  }

  /**
   * Método principal de parsing - implementar en cada parser
   */
  abstract parse(text: string): ParsedTicket;

  // ═══════════════════════════════════════════════════════
  // HELPERS COMPARTIDOS
  // ═══════════════════════════════════════════════════════

  /**
   * Normaliza texto para búsqueda de patrones
   */
  protected normalize(text: string): string {
    return text.toUpperCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Obtiene líneas limpias del texto
   */
  protected getLines(text: string): string[] {
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  /**
   * Parsea precio en formato colombiano
   * "4.500" | "4,500" | "4500" | "$4.500" → 4500
   */
  protected parsePrice(str: string): number {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  /**
   * Extrae fecha con múltiples formatos
   */
  protected extractDate(text: string): { value: Date | null; raw: string; confidence: number } {
    const patterns = [
      // 2024-09-11 11:30:07
      { re: /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/, fmt: 'ISO' },
      // 2024/09/11
      { re: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, fmt: 'YMD' },
      // 11/09/2024
      { re: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, fmt: 'DMY' },
      // 11/09/24
      { re: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})(?!\d)/, fmt: 'DMY2' },
    ];

    for (const { re, fmt } of patterns) {
      const m = text.match(re);
      if (m) {
        let date: Date | null = null;
        try {
          if (fmt === 'ISO' || fmt === 'YMD') {
            date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
          } else if (fmt === 'DMY') {
            date = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
          } else if (fmt === 'DMY2') {
            const y = parseInt(m[3]) > 50 ? 1900 + parseInt(m[3]) : 2000 + parseInt(m[3]);
            date = new Date(y, parseInt(m[2]) - 1, parseInt(m[1]));
          }
        } catch { date = null; }

        return { value: date, raw: m[0], confidence: date ? 0.9 : 0.5 };
      }
    }

    return { value: null, raw: '', confidence: 0 };
  }

  /**
   * Extrae total buscando patrones comunes
   */
  protected extractTotal(lines: string[]): { total: number; confidence: number } {
    const patterns = [
      /TOTAL\s*[:\.]?\s*\$?\s*([\d\.,]+)/i,
      /VALOR\s*TOTAL\s*[:\.]?\s*\$?\s*([\d\.,]+)/i,
      /VALOR\s*PAGADO\s*[:\.]?\s*\$?\s*([\d\.,]+)/i,
      /\*\*SUBTOTAL\/TOTAL\s*-+>\s*\$?\s*([\d\.,]+)/i,
    ];

    for (const line of [...lines].reverse()) { // Buscar desde abajo
      for (const p of patterns) {
        const m = line.match(p);
        if (m) {
          return { total: this.parsePrice(m[1]), confidence: 0.9 };
        }
      }
    }

    return { total: 0, confidence: 0 };
  }

  /**
   * Limpia nombre de producto
   */
  protected cleanProductName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^[\d\s]+/, '') // Quitar códigos al inicio
      .toUpperCase();
  }

  /**
   * Crea un ParsedItem con defaults
   */
  protected createItem(partial: Partial<ParsedItem> & { description: string; totalPrice: number }, lineNum: number): ParsedItem {
    return {
      lineNumber: lineNum,
      rawLine: partial.rawLine || '',
      description: this.cleanProductName(partial.description),
      quantity: partial.quantity || 1,
      unitPrice: partial.unitPrice || partial.totalPrice,
      totalPrice: partial.totalPrice,
      code: partial.code,
      unit: partial.unit || 'UN',
      confidence: partial.confidence || 0.7,
      flags: partial.flags,
    };
  }

  /**
   * Crea respuesta base de ParsedTicket
   */
  protected createTicketBase(text: string, items: ParsedItem[], lines: string[]): ParsedTicket {
    const dateInfo = this.extractDate(text);
    const totalInfo = this.extractTotal(lines);

    return {
      store: {
        key: this.key,
        name: this.storeName,
        confidence: 1,
      },
      date: dateInfo,
      items,
      totals: {
        total: totalInfo.total,
        confidence: totalInfo.confidence,
      },
      meta: {
        parserUsed: this.key,
        parsedAt: new Date(),
        rawText: text,
        warnings: [],
      },
    };
  }
}