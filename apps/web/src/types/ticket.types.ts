// src/types/ticket.types.ts

export type TicketScanStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'CONFIRMED' | 'FAILED';
export type TicketScanItemStatus = 'PENDING' | 'MATCHED' | 'NEW' | 'IGNORED' | 'CONFIRMED';

export interface MatchedProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  brand: string;
  similarity: number;
}

export interface TicketScanItem {
  id: string;
  rawText: string;
  detectedName: string;
  detectedPrice: number | null;      // Precio total de la línea
  detectedQuantity: number;           // Cantidad (unidades o kg)
  detectedUnitPrice: number | null;   // Precio unitario calculado
  status: TicketScanItemStatus;
  matchConfidence: number | null;
  matchedProduct: MatchedProduct | null;
  suggestions: ProductSuggestion[];
}

export interface TicketScan {
  id: string;
  imageUrl: string;
  status: TicketScanStatus;
  storeName: string | null;
  purchaseDate: string | null;
  itemsCount: number;
  totalAmount: number | null;
  items: TicketScanItem[];
  processingTimeMs: number;
}

export interface TicketListItem {
  id: string;
  imageUrl: string;
  status: TicketScanStatus;
  storeName: string | null;
  purchaseDate: string | null;
  itemsCount: number;
  totalAmount: number | null;
  createdAt: string;
}

export interface TicketListResponse {
  tickets: TicketListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadTicketResponse {
  success: boolean;
  data: TicketScan;
  message: string;
}