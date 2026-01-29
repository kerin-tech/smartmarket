// src/components/features/purchases/ScanTicketButton.tsx
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { purchaseService } from '@/services/purchase.service';

export function ScanTicketButton({ onScanCompleted }: { onScanCompleted: (data: any) => void }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const data = await purchaseService.scanTicket(reader.result as string);
        onScanCompleted(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsScanning(false);
        e.target.value = ''; // Reset para permitir subir la misma foto
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        capture="environment" // Mobile: Cámara | Web: Archivos
        className="hidden"
        id="scan-ticket-standalone"
        onChange={handleFileChange}
      />
      <label htmlFor="scan-ticket-standalone" className="block w-full cursor-pointer">
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="pointer-events-none" // Evita que el botón intercepte el click del label
          leftIcon={isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          disabled={isScanning}
        >
          {isScanning ? 'Procesando...' : 'Escanear con IA'}
        </Button>
      </label>
    </div>
  );
}