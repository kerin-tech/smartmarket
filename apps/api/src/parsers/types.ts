// src/parsers/types.ts
import { TicketLine, ParsedTicket } from '../types/ocr.types';

export interface ITicketParser {
  readonly storeId: string;
  canHandle(lines: string[], fullText: string): boolean;
  parse(lines: string[], fullText: string): Partial<ParsedTicket>;
}

// Utilidad común para limpiar precios colombianos (ej: "4.500,00" -> 4500)
export const cleanColombianPrice = (val: string): number => {
  const cleaned = val.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
};