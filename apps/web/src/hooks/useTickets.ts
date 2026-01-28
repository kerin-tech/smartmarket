// src/hooks/useTickets.ts

import { useState, useCallback } from 'react';
import * as ticketService from '@/services/ticket.service';
import type { TicketScan, TicketListItem } from '@/types/ticket.types';

interface UseTicketUploadReturn {
  ticket: TicketScan | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadTicket: (file: File) => Promise<TicketScan | null>;
  reset: () => void;
}

/**
 * Hook para subir y procesar tickets
 */
export function useTicketUpload(): UseTicketUploadReturn {
  const [ticket, setTicket] = useState<TicketScan | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadTicket = useCallback(async (file: File): Promise<TicketScan | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simular progreso durante la subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await ticketService.uploadTicket(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTicket(result);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el ticket';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTicket(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    ticket,
    isUploading,
    uploadProgress,
    error,
    uploadTicket,
    reset,
  };
}

interface UseTicketsListReturn {
  tickets: TicketListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  fetchTickets: (page?: number) => Promise<void>;
  deleteTicket: (id: string) => Promise<boolean>;
}

/**
 * Hook para listar tickets
 */
export function useTicketsList(): UseTicketsListReturn {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchTickets = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ticketService.getTickets(page);
      setTickets(response.tickets);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tickets';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (id: string): Promise<boolean> => {
    try {
      await ticketService.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    tickets,
    isLoading,
    error,
    pagination,
    fetchTickets,
    deleteTicket,
  };
}