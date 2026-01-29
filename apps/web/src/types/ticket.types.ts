export type TicketStatus = 'MATCHED' | 'NEW' | 'IGNORED' | 'PENDING';

export interface TicketScanItem {
  id: string;
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  discountPercentage?: number;
  rawText?: string;
  status: TicketStatus;
  matchedProduct?: {
    id: string;
    name: string;
  };
  suggestions: Array<{
    id: string;
    name: string;
    similarity: number;
  }>;
}

export interface TicketScan {
  id?: string;
  imageUrl: string;
  detectedStore?: string;
  purchaseDate?: string;
  items: TicketScanItem[];
}