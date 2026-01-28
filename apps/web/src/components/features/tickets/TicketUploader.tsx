// src/components/features/tickets/TicketUploader.tsx

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TicketDropzone } from './TicketDropzone';
import { useTicketUpload } from '@/hooks/useTickets';
import { cn } from '@/lib/utils';

export function TicketUploader() {
  const router = useRouter();
  const { ticket, isUploading, uploadProgress, error, uploadTicket, reset } = useTicketUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    reset();
  }, [reset]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    const result = await uploadTicket(selectedFile);
    
    if (result) {
      // Redirigir a la página de revisión
      router.push(`/tickets/${result.id}/review`);
    }
  }, [selectedFile, uploadTicket, router]);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    reset();
  }, [reset]);

  // Estado: Selección de archivo
  if (!selectedFile) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <TicketDropzone onFileSelect={handleFileSelect} />
        
        {/* Botón alternativo para móvil */}
        <div className="mt-4 flex justify-center">
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tomar foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  // Estado: Preview y confirmación
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Preview de imagen */}
      <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4">
        <img
          src={previewUrl || ''}
          alt="Preview del ticket"
          className="w-full h-auto max-h-96 object-contain"
        />
        
        {/* Overlay de progreso */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
            <div className="w-48 bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-white text-sm">
              {uploadProgress < 100 ? 'Procesando ticket...' : '¡Completado!'}
            </p>
          </div>
        )}
      </div>

      {/* Información del archivo */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 truncate">
          <span className="font-medium">Archivo:</span> {selectedFile.name}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Tamaño:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          disabled={isUploading}
          className={cn(
            'flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors',
            isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          )}
        >
          Cancelar
        </button>
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={cn(
            'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors',
            isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          )}
        >
          {isUploading ? 'Procesando...' : 'Procesar ticket'}
        </button>
      </div>
    </div>
  );
}