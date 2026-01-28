// src/services/ticketService.ts

import api from './api';
import type { 
  TicketScan, 
  TicketListResponse, 
  UploadTicketResponse 
} from '@/types/ticket.types';

/**
 * Sube y procesa una imagen de ticket
 */
export async function uploadTicket(imageFile: File): Promise<TicketScan> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post<UploadTicketResponse>('/tickets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 segundos para OCR
  });

  return response.data.data;
}

/**
 * Obtiene un ticket por ID
 */
export async function getTicketById(ticketId: string): Promise<TicketScan> {
  const response = await api.get<{ success: boolean; data: TicketScan }>(`/tickets/${ticketId}`);
  return response.data.data;
}

/**
 * Lista los tickets del usuario
 */
export async function getTickets(page = 1, limit = 20): Promise<TicketListResponse> {
  const response = await api.get<{ success: boolean; data: TicketListResponse }>('/tickets', {
    params: { page, limit },
  });
  return response.data.data;
}

/**
 * Elimina un ticket no confirmado
 */
export async function deleteTicket(ticketId: string): Promise<void> {
  await api.delete(`/tickets/${ticketId}`);
}

/**
 * Confirma un ticket y crea las compras
 */
export interface ConfirmTicketItem {
  id: string;
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  matchedProductId: string | null;
  status: string;
}

export interface ConfirmTicketData {
  storeId: string;
  purchaseDate: string;
  items: ConfirmTicketItem[];
}

export async function confirmTicket(
  ticketId: string, 
  data: ConfirmTicketData
): Promise<{ purchasesCreated: number; productsCreated: number }> {
  const response = await api.post<{ 
    success: boolean; 
    data: { purchasesCreated: number; productsCreated: number } 
  }>(`/tickets/${ticketId}/confirm`, data);
  
  return response.data.data;
}

/**
 * Actualiza un item del ticket
 */
export async function updateTicketItem(
  ticketId: string,
  itemId: string,
  data: Partial<{
    detectedName: string;
    detectedPrice: number;
    detectedQuantity: number;
    matchedProductId: string;
    status: string;
  }>
): Promise<void> {
  await api.put(`/tickets/${ticketId}/items/${itemId}`, data);
}

/**
 * Verifica el estado de los servicios de OCR
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get('/tickets/health');
    return response.data.success;
  } catch {
    return false;
  }
}