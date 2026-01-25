'use client';

import { CalendarX2, Plus, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface HistoryEmptyStateProps {
  monthLabel?: string;
  hasAnyHistory: boolean;
}

export function HistoryEmptyState({ monthLabel, hasAnyHistory }: HistoryEmptyStateProps) {
  // Extraemos la lógica a variables simples, así TS no se confunde con objetos complejos
  const title = !hasAnyHistory 
    ? "Sin historial de compras" 
    : `Sin compras en ${monthLabel}`;

  const description = !hasAnyHistory
    ? "Registra tu primera compra para comenzar a ver tu historial de gastos y análisis detallados."
    : "No hay compras registradas para este mes. Navega a otro mes o registra una nueva compra.";

  const buttonLabel = !hasAnyHistory ? "Registrar primera compra" : "Registrar compra";
  
  const icon = !hasAnyHistory 
    ? <CalendarX2 className="h-10 w-10 text-primary-600" />
    : <ArrowLeftRight className="h-10 w-10 text-muted-foreground" />;

  const bgColor = !hasAnyHistory ? "bg-muted" : "bg-muted";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-[2rem] border border-border shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <div className={`w-24 h-24 rounded-full ${bgColor} flex items-center justify-center mb-8`}>
        {icon}
      </div>
      
      <h2 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">
        {title}
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
        {description}
      </p>
      
      <Link href="/purchases">
        <Button 
          size="lg"
          // Usamos el condicional directo aquí para que TS detecte los strings literales
          variant={'outline'}
          leftIcon={<Plus className="h-5 w-5" />}
          className={!hasAnyHistory ? "shadow-xl shadow-primary/20 px-8" : "px-8"}
        >
          {buttonLabel}
        </Button>
      </Link>
    </div>
  );
}