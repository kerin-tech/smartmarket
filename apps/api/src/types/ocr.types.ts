// src/types/ocr.types.ts

export interface OcrTextBlock {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OcrResult {
  fullText: string;
  blocks: OcrTextBlock[];
  lines: string[];
}

export interface TicketLine {
  rawText: string;
  productName: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  confidence: number;
}

export interface ParsedTicket {
  storeName: string | null;
  date: string | null;
  lines: TicketLine[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  rawText: string;
}

export interface OcrProcessingOptions {
  enhanceContrast?: boolean;
  autoRotate?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface OcrServiceResponse {
  success: boolean;
  data?: ParsedTicket;
  error?: string;
  processingTimeMs: number;
}