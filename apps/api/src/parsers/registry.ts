// src/parsers/registry.ts

import {
  ITicketParser,
  ParsedTicket,
  DetectionResult,
  DetectionResponse,
  SupportedStore,
} from './types';

const CONFIDENCE_THRESHOLD = 0.7;

class ParserRegistry {
  private parsers: Map<string, ITicketParser> = new Map();

  /**
   * Registra un parser
   */
  register(parser: ITicketParser): void {
    this.parsers.set(parser.key, parser);
    console.log(`✓ Parser registrado: ${parser.key} (${parser.storeName})`);
  }

  /**
   * Detecta tiendas que pueden parsear el texto
   * Retorna ordenado por confianza (mayor primero)
   */
  detect(text: string): DetectionResult[] {
    const results: DetectionResult[] = [];

    for (const parser of this.parsers.values()) {
      const result = parser.canParse(text);
      if (result && result.confidence > 0) {
        results.push(result);
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detecta tienda y determina si necesita confirmación
   */
  detectWithConfirmation(text: string): DetectionResponse {
    const results = this.detect(text);

    if (results.length === 0) {
      return {
        detected: false,
        results: [],
        needsConfirmation: true,
        suggested: null,
      };
    }

    const best = results[0];
    return {
      detected: true,
      results,
      needsConfirmation: best.confidence < CONFIDENCE_THRESHOLD,
      suggested: best,
    };
  }

  /**
   * Obtiene parser por key
   */
  getParser(key: string): ITicketParser | undefined {
    return this.parsers.get(key);
  }

  /**
   * Obtiene el mejor parser para el texto
   */
  getBestParser(text: string): ITicketParser | null {
    const results = this.detect(text);
    if (results.length === 0) return null;
    return this.parsers.get(results[0].storeKey) || null;
  }

  /**
   * Lista tiendas soportadas
   */
  getSupportedStores(): SupportedStore[] {
    return Array.from(this.parsers.values()).map((p) => ({
      key: p.key,
      name: p.storeName,
    }));
  }

  /**
   * Parsea un ticket
   * @param text Texto del OCR
   * @param forceKey Forzar parser específico (opcional)
   */
  parse(text: string, forceKey?: string): ParsedTicket {
    let parser: ITicketParser | undefined;

    if (forceKey) {
      parser = this.parsers.get(forceKey);
      if (!parser) {
        throw new Error(`Parser '${forceKey}' no encontrado`);
      }
    } else {
      parser = this.getBestParser(text) || this.parsers.get('generic');
      if (!parser) {
        throw new Error('No hay parser disponible');
      }
    }

    return parser.parse(text);
  }

  /**
   * Verifica si hay parsers registrados
   */
  hasParses(): boolean {
    return this.parsers.size > 0;
  }

  /**
   * Cantidad de parsers registrados
   */
  count(): number {
    return this.parsers.size;
  }
}

// Singleton
export const parserRegistry = new ParserRegistry();