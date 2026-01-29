// src/parsers/types.ts

/**
 * Ítem parseado de un ticket
 */
export interface ParsedItem {
  lineNumber: number;
  rawLine: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  code?: string;
  unit?: string;
  confidence: number; // 0-1
  flags?: string[];   // ['needs_review', 'price_estimated']
}

/**
 * Ticket parseado completo
 */
export interface ParsedTicket {
  store: {
    key: string;
    name: string;
    nit?: string;
    address?: string;
    confidence: number;
  };
  date: {
    value: Date | null;
    raw: string;
    confidence: number;
  };
  items: ParsedItem[];
  totals: {
    subtotal?: number;
    tax?: number;
    discount?: number;
    total: number;
    confidence: number;
  };
  payment?: {
    method: 'cash' | 'card' | 'mixed' | 'unknown';
    cardLastDigits?: string;
  };
  meta: {
    parserUsed: string;
    parsedAt: Date;
    rawText: string;
    warnings: string[];
  };
}

/**
 * Resultado de detección de tienda
 */
export interface DetectionResult {
  storeKey: string;
  storeName: string;
  confidence: number;
  matchedPatterns: string[];
}

/**
 * Respuesta del detector de tienda
 */
export interface DetectionResponse {
  detected: boolean;
  results: DetectionResult[];
  needsConfirmation: boolean;
  suggested: DetectionResult | null;
}

/**
 * Interfaz que todo parser debe implementar
 */
export interface ITicketParser {
  readonly key: string;
  readonly storeName: string;
  readonly nitPatterns: RegExp[];
  readonly identityPatterns: RegExp[];
  
  canParse(text: string): DetectionResult | null;
  parse(text: string): ParsedTicket;
}

/**
 * Tienda soportada (para UI)
 */
export interface SupportedStore {
  key: string;
  name: string;
  logo?: string;
}