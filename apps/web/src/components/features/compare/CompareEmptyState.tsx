'use client';

import { Scale, Plus, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CompareEmptyStateProps {
  hasAnyHistory: boolean;
}

export function CompareEmptyState({ hasAnyHistory }: CompareEmptyStateProps) {
  const title = !hasAnyHistory 
    ? "Sin datos para comparar" 
    : "No hay datos suficientes";

  const description = !hasAnyHistory
    ? "Necesitas registrar tus primeras compras para poder realizar comparativas entre meses y ver tu evolución."
    : "Para comparar, asegúrate de tener compras registradas en los periodos seleccionados.";

  const buttonLabel = !hasAnyHistory ? "Registrar primera compra" : "Registrar compra";
  
  const icon = !hasAnyHistory 
    ? <Scale className="h-10 w-10 text-primary-600" />
    : <ArrowLeftRight className="h-10 w-10 text-muted-foreground" />;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-[2rem] border border-border shadow-sm animate-in fade-in zoom-in-95 duration-300">
      {/* Mantenemos bg-muted según tus ajustes */}
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8">
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
          variant="outline" // Ajustado a outline como pediste
          leftIcon={<Plus className="h-5 w-5" />}
          className={!hasAnyHistory ? "px-8" : "px-8"}
        >
          {buttonLabel}
        </Button>
      </Link>
    </div>
  );
}