'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { purchaseService } from '@/services/purchase.service';

// Estos son los componentes que crearemos a continuación
import { TicketUploader } from './TicketUploader';
import { TicketReviewForm } from './TicketReviewForm';
import type { TicketScan } from '@/types/ticket.types';

export function TicketScanView() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [scannedData, setScannedData] = useState<TicketScan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPurchase = async (data: any) => {
    setIsSubmitting(true);
    try {
      await purchaseService.create(data);
      success('Compra masiva registrada con éxito');
      router.push('/purchases');
    } catch (err: any) {
      showError(err.message || 'Error al guardar la compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => scannedData ? setScannedData(null) : router.back()}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {scannedData ? 'Revisión de Compra' : 'Escanear Ticket'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {scannedData 
              ? 'Verifica los productos detectados antes de guardar.' 
              : 'Sube una foto clara para registrar múltiples productos a la vez.'}
          </p>
        </div>
      </div>

      {!scannedData ? (
        <TicketUploader onSuccess={setScannedData} />
      ) : (
        <TicketReviewForm 
  ticket={scannedData} 
  isLoading={isSubmitting} // Ahora ya no dará error de tipo
  onConfirm={handleConfirmPurchase}
  onCancel={() => setScannedData(null)}
/>
      )}
    </div>
  );
}