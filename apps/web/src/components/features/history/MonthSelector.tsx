// src/components/features/history/MonthSelector.tsx

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  currentMonth: string; // YYYY-MM
  monthLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  disabled?: boolean; // Prop añadida para manejar estados de carga
}

export function MonthSelector({
  currentMonth,
  monthLabel,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  disabled = false,
}: MonthSelectorProps) {
  return (
    <div className={cn(
      "flex items-center justify-between bg-card rounded-xl border border-border p-3 transition-opacity",
      disabled && "opacity-60 pointer-events-none" // Se atenúa y bloquea clics si está cargando
    )}>
      <button
        onClick={onPrevious}
        disabled={!hasPrevious || disabled}
        className={cn(
          'p-2 rounded-lg transition-colors',
          hasPrevious && !disabled
            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'text-secondary-300 cursor-not-allowed'
        )}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-6 w-6" /> {/* Un poco más grande para mejor legibilidad */}
      </button>

      <span className="text-xl font-bold text-foreground capitalize px-4">
        {monthLabel}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext || disabled}
        className={cn(
          'p-2 rounded-lg transition-colors',
          hasNext && !disabled
            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'text-secondary-300 cursor-not-allowed'
        )}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}