'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, Loader2, FolderOpen } from 'lucide-react'; // Agregué FolderOpen
import { cn } from '@/lib/utils';

interface TicketUploaderProps {
  onImageSelect: (base64: string, preview: string) => void;
  isLoading?: boolean;
  preview?: string | null;
}

const LOADING_MESSAGES = [
  { time: 0, message: 'Analizando ticket...' },
  { time: 5000, message: 'Extrayendo información...' },
  { time: 15000, message: 'Identificando productos...' },
  { time: 30000, message: 'Buscando coincidencias...' },
  { time: 45000, message: 'Casi listo, procesando detalles...' },
  { time: 60000, message: 'Tickets largos requieren más tiempo...' },
  { time: 90000, message: 'Por favor espera, estamos terminando...' },
];

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const isMobile = isMobileDevice();
    const maxWidth = isMobile ? 1280 : 1920;
    const quality = isMobile ? 0.65 : 0.85;
    const maxFileSize = isMobile ? 800 : 1500;
    
    img.onload = () => {
      try {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        const maxHeight = isMobile ? 2500 : 3500;
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          reject(new Error('No se pudo crear contexto de canvas'));
          return;
        }
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        let currentQuality = quality;
        let compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);
        let attempts = 0;
        
        while (compressedBase64.length > maxFileSize * 1024 * 1.33 && attempts < 3) {
          currentQuality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', Math.max(currentQuality, 0.4));
          attempts++;
        }
        
        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export function TicketUploader({ onImageSelect, isLoading, preview }: TicketUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].message);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      setLoadingMessage(LOADING_MESSAGES[0].message);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    
    const currentMessage = [...LOADING_MESSAGES]
      .reverse()
      .find(m => elapsedTime >= m.time);
    
    if (currentMessage) {
      setLoadingMessage(currentMessage.message);
    }
  }, [elapsedTime, isLoading]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const isMobile = isMobileDevice();
    
    try {
      setIsCompressing(true);
      setCompressionStatus(isMobile ? 'Optimizando foto...' : 'Optimizando imagen...');
      
      const compressedBase64 = await compressImage(file);
      const previewUrl = URL.createObjectURL(file);
      
      setIsCompressing(false);
      setCompressionStatus('');
      onImageSelect(compressedBase64, previewUrl);
      
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      setIsCompressing(false);
      setCompressionStatus('');
      
      if (isMobile) {
        alert('Error al procesar la imagen. Intenta con otra foto.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelect(base64, URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    
    // Resetear el valor para permitir subir la misma imagen dos veces si falla
    e.target.value = '';
  }, [processFile]);

  // --- NUEVA LÓGICA DE CLICKS ---

  // Para Galería / Archivos (Limpia el atributo capture)
  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  // Para Cámara Directa (Fuerza el atributo capture)
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  if (isCompressing) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-foreground font-medium">{compressionStatus}</p>
          <p className="text-muted-foreground text-sm mt-1">Esto mejora la velocidad de análisis</p>
        </div>
      </div>
    );
  }

  if (isLoading && preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
        <img src={preview} alt="Ticket" className="w-full h-80 object-cover opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
          <p className="text-white font-medium text-center px-4">{loadingMessage}</p>
          <p className="text-white/60 text-sm mt-2">
            Tiempo: {formatTime(elapsedTime)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input oculto - NOTA: Se eliminó capture="environment" por defecto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Dropzone Desktop y Mobile (Comportamiento por defecto: Galería/Opciones) */}
      <div
        onClick={handleGalleryClick} // Usamos la nueva función
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          'hover:border-primary hover:bg-primary/5',
          isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border bg-card'
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            <Upload className="h-8 w-8" />
          </div>

          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragging ? 'Suelta la imagen aquí' : 'Sube tu ticket'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
              Arrastra una imagen o haz clic para seleccionar
            </p>
            <p className="text-sm text-muted-foreground mt-1 sm:hidden">
              Toca para seleccionar de la galería o archivos
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>JPG, PNG o HEIC</span>
          </div>
        </div>
      </div>

      {/* Botones de acción móvil explícitos */}
      <div className="flex gap-3 sm:hidden">
        {/* Botón Cámara */}
        <button
          onClick={handleCameraClick}
          className="flex flex-1 items-center justify-center gap-2 py-4 px-4 bg-primary text-primary-foreground rounded-xl font-medium transition-transform active:scale-95"
        >
          <Camera className="h-5 w-5" />
          <span>Cámara</span>
        </button>

      </div>

      {/* Tips */}
      <div className="bg-muted/50 rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-2">💡 Tips para mejores resultados:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Asegúrate de que el ticket esté bien iluminado</li>
          <li>• Captura todo el ticket en la foto</li>
          <li>• Evita sombras y reflejos</li>
        </ul>
      </div>
    </div>
  );
}