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
}

export function MonthSelector({
  currentMonth,
  monthLabel,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-secondary-200 p-3">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          'p-2 rounded-lg transition-colors',
          hasPrevious
            ? 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            : 'text-secondary-300 cursor-not-allowed'
        )}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="text-lg font-semibold text-secondary-900 capitalize">
        {monthLabel}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          'p-2 rounded-lg transition-colors',
          hasNext
            ? 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            : 'text-secondary-300 cursor-not-allowed'
        )}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}