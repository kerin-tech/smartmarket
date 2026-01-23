// src/components/features/history/HistoryEmptyState.tsx

'use client';

import { CalendarX2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface HistoryEmptyStateProps {
  monthLabel?: string;
  hasAnyHistory: boolean;
}

export function HistoryEmptyState({ monthLabel, hasAnyHistory }: HistoryEmptyStateProps) {
  if (!hasAnyHistory) {
    // Usuario sin ninguna compra registrada
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mb-6">
          <CalendarX2 className="h-10 w-10 text-secondary-400" />
        </div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Sin historial de compras
        </h2>
        <p className="text-secondary-500 mb-6 max-w-sm">
          Registra tu primera compra para comenzar a ver tu historial de gastos
          y análisis detallados.
        </p>
        <Link href="/purchases">
          <Button leftIcon={<Plus className="h-5 w-5" />}>
            Registrar primera compra
          </Button>
        </Link>
      </div>
    );
  }

  // Mes específico sin datos
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center mb-6">
        <CalendarX2 className="h-10 w-10 text-secondary-400" />
      </div>
      <h2 className="text-xl font-semibold text-secondary-900 mb-2">
        Sin compras en {monthLabel}
      </h2>
      <p className="text-secondary-500 mb-6 max-w-sm">
        No hay compras registradas para este mes. Navega a otro mes o registra
        una nueva compra.
      </p>
      <Link href="/purchases">
        <Button variant="outline" leftIcon={<Plus className="h-5 w-5" />}>
          Registrar compra
        </Button>
      </Link>
    </div>
  );
}