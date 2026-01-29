'use client';

import { useState } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { purchaseService } from '@/services/purchase.service';
import { useToast } from '@/hooks/useToast';

interface TicketUploaderProps {
  onSuccess: (data: any) => void;
}

export function TicketUploader({ onSuccess }: TicketUploaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const { error: showError } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        // Usamos tu servicio con el base64 directo
        const data = await purchaseService.scanTicket(base64);
        
        // Al terminar, enviamos la data + el base64 para la previsualización
        onSuccess({ ...data, imageUrl: base64 });
      } catch (error: any) {
        console.error("Error:", error);
        showError("Error al procesar el ticket");
      } finally {
        setIsScanning(false);
        e.target.value = ''; // Tu reset original
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full p-12 border-2 border-dashed border-zinc-200 rounded-[2.5rem] bg-white text-center">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          id="scan-ticket-standalone"
          onChange={handleFileChange}
          disabled={isScanning}
        />
        
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            {isScanning ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <Camera className="h-10 w-10 text-primary" />
            )}
          </div>

          <h3 className="text-2xl font-bold mb-2">
            {isScanning ? 'Procesando ticket...' : 'Sube tu ticket'}
          </h3>
          <p className="text-zinc-500 mb-8 max-w-xs">
            {isScanning 
              ? 'Estamos extrayendo la información de tu compra.' 
              : 'Toma una foto para registrar todos los productos automáticamente.'}
          </p>

          <label htmlFor="scan-ticket-standalone" className="w-full cursor-pointer">
            <Button
              type="button"
              variant="primary"
              className="pointer-events-none h-14 w-full rounded-2xl text-lg shadow-lg shadow-primary/20"
              leftIcon={isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              disabled={isScanning}
            >
              {isScanning ? 'Analizando...' : 'Seleccionar Imagen'}
            </Button>
          </label>
        </div>
      </div>
      
      <p className="mt-6 text-xs text-zinc-400 font-medium uppercase tracking-widest">
        IA SmartMarket • Registro en Masa
      </p>
    </div>
  );
}