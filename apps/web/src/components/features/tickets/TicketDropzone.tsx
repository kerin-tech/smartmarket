// src/components/features/tickets/TicketDropzone.tsx

'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface TicketDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export function TicketDropzone({ 
  onFileSelect, 
  disabled = false,
  maxSizeMB = 5 
}: TicketDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa JPG, PNG o WEBP.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `La imagen no debe superar ${maxSizeMB}MB.`;
    }
    return null;
  }, [maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [disabled, handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input para permitir seleccionar el mismo archivo
    e.target.value = '';
  }, [handleFile]);

  return (
    <div className="w-full">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragging && 'border-blue-500 bg-blue-50',
          disabled && 'opacity-50 cursor-not-allowed',
          !isDragging && !disabled && 'border-gray-300 bg-gray-50 hover:bg-gray-100',
          error && 'border-red-300 bg-red-50'
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          {/* Icono de cámara/imagen */}
          <svg
            className={cn(
              'w-12 h-12 mb-4',
              isDragging ? 'text-blue-500' : 'text-gray-400'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Haz clic para subir</span> o arrastra tu ticket aquí
          </p>
          <p className="text-xs text-gray-400">
            JPG, PNG o WEBP (máx. {maxSizeMB}MB)
          </p>
        </div>

        <input
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
        />
      </label>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}