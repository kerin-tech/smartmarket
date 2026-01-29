// src/types/ticket.types.ts

// === RESPONSE FROM SCAN API ===

export interface ProductMatch {
  product_id: string;
  name: string;
  category: string;
  brand?: string;
  confidence: number;
  match_level: 'high' | 'medium' | 'low';
}

export interface StoreMatch {
  store_id: string;
  name: string;
  location: string;
  confidence: number;
}

export interface ScannedItem {
  detected_name: string;
  detected_price: number;        // Precio final (con descuento aplicado si lo hay)
  detected_quantity: number;
  detected_category: string;
  detected_brand?: string;
  
  // Campos de descuento
  has_discount: boolean;
  original_price?: number;       // Precio lista (sin descuento)
  discount_amount?: number;      // Valor del descuento
  discount_percentage?: number;  // Porcentaje de descuento
  
  match: ProductMatch | null;
  suggestions: ProductMatch[];
}

export interface ScanTicketResponse {
  ticket_id: string;
  detected_date: string;
  detected_store: string;
  store_matches: StoreMatch[];
  selected_store: StoreMatch | null;
  items: ScannedItem[];
  summary: {
    total_items: number;
    matched_count: number;
    suggested_count: number;
    new_products_count: number;
    detected_total: number;      // Total leído del ticket
    calculated_total: number;    // Total calculado de items
    total_savings?: number;      // Total ahorrado en descuentos
  };
}

// === EDITABLE STATE FOR REVIEW ===

export type UserDecision = 'accept_match' | 'select_suggestion' | 'create_new' | 'skip';

export interface EditableItem extends ScannedItem {
  tempId: string;
  isEditing: boolean;
  isDeleted: boolean;
  selected_match: ProductMatch | null;
  user_decision?: UserDecision;
}

export interface TicketReviewState {
  ticket_id: string;
  detected_date: string;
  detected_store: string;
  store_matches: StoreMatch[];
  selected_store: StoreMatch | null;
  items: EditableItem[];
  summary: {
    total_items: number;
    matched_count: number;
    suggested_count: number;
    new_products_count: number;
    detected_total?: number;
    calculated_total?: number;
    total_savings?: number;
  };
}

// === CONFIRM PAYLOAD ===

export interface ConfirmTicketItem {
  detected_name: string;
  detected_price: number;          // Precio unitario final (con descuento aplicado)
  detected_quantity: number;
  detected_category: string;
  detected_brand?: string;
  
  // Descuento - solo necesitamos el porcentaje para la BD
  discount_percentage: number;     // 0 si no hay descuento
  
  match: ProductMatch | null;
  user_decision: UserDecision;
}

export interface ConfirmTicketPayload {
  detected_date: string;
  detected_store: string;
  selected_store_id: string | null;
  items: ConfirmTicketItem[];
}

// === UTILITY FUNCTIONS ===

/**
 * Calcula el precio unitario efectivo considerando descuentos
 */
export function calculateEffectiveUnitPrice(item: ScannedItem | EditableItem): number {
  return item.detected_price; // El precio detectado ya es el precio final
}

/**
 * Calcula el subtotal de un item (precio × cantidad)
 */
export function calculateItemSubtotal(item: ScannedItem | EditableItem): number {
  return item.detected_price * item.detected_quantity;
}

/**
 * Calcula el ahorro de un item si tiene descuento
 */
export function calculateItemSavings(item: ScannedItem | EditableItem): number {
  if (!item.has_discount || !item.original_price) return 0;
  return (item.original_price - item.detected_price) * item.detected_quantity;
}

/**
 * Calcula el porcentaje de descuento si no viene calculado
 */
export function calculateDiscountPercentage(originalPrice: number, finalPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}

/**
 * Inferir si hay descuento comparando precio original vs final
 */
export function inferDiscount(originalPrice: number | undefined, finalPrice: number): {
  has_discount: boolean;
  discount_amount: number;
  discount_percentage: number;
} {
  if (!originalPrice || originalPrice <= finalPrice) {
    return { has_discount: false, discount_amount: 0, discount_percentage: 0 };
  }
  
  const discount_amount = originalPrice - finalPrice;
  const discount_percentage = calculateDiscountPercentage(originalPrice, finalPrice);
  
  return {
    has_discount: true,
    discount_amount,
    discount_percentage
  };
}