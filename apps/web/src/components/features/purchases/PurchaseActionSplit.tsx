// src/components/purchases/PurchaseActionSplit.tsx
'use client';

import { Sparkles, ChevronDown, Plus, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Popover } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

interface PurchaseActionSplitProps {
  onManualClick: () => void;
}

export function PurchaseActionSplit({ onManualClick }: PurchaseActionSplitProps) {
  const Trigger = (
    <button className={cn(
      "h-11 px-2.5 flex items-center justify-center transition-all active:scale-[0.95]",
      "bg-primary text-primary-foreground hover:bg-primary-hover",
      "rounded-r-xl border-l border-primary-foreground/20",
      "focus:outline-none focus:ring-2 focus:ring-primary/20"
    )}>
      <ChevronDown className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex items-center">
      <div className="inline-flex items-center -space-x-px">
        {/* Acción Principal: IA / Escaneo Masivo */}
        <Link href="/purchases/scan" className="z-10">
          <Button
            variant="primary"
            className="rounded-r-none border-r border-primary-foreground/10"
            leftIcon={<Sparkles className="h-5 w-5" />}
          >
            Escanear Ticket
          </Button>
        </Link>

        {/* Popover Custom */}
        <Popover trigger={Trigger}>
          <div className="flex flex-col gap-1">
            <button
              onClick={onManualClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-muted rounded-xl transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Agregar manual
            </button>
          </div>
        </Popover>
      </div>
    </div>
  );
}