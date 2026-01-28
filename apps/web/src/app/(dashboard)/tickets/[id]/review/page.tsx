// src/app/(dashboard)/tickets/[id]/review/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TicketReviewForm } from '@/components/features/tickets/TicketReviewForm';
import { getTicketById } from '@/services/ticket.service';
import type { TicketScan } from '@/types/ticket.types';

export default function ReviewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketScan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await getTicketById(ticketId);
        
        // Si ya está confirmado, redirigir
        if (data.status === 'CONFIRMED') {
          router.push('/purchases');
          return;
        }
        
        setTicket(data);
      } catch (err) {
        setError('No se pudo cargar el ticket');
      } finally {
        setIsLoading(false);
      }
    }

    loadTicket();
  }, [ticketId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Ticket no encontrado'}</p>
          <button
            onClick={() => router.push('/tickets/scan')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Escanear otro ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revisar ticket</h1>
        <p className="text-gray-600">
          Revisa y corrige los productos detectados antes de confirmar
        </p>
      </div>

      {/* Formulario de revisión */}
      <TicketReviewForm ticket={ticket} />
    </div>
  );
}