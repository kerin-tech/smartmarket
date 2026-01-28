// src/components/features/tickets/TicketImagePreview.tsx

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TicketImagePreviewProps {
  imageUrl: string;
}

export function TicketImagePreview({ imageUrl }: TicketImagePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => setIsZoomed(true)}
        className="relative rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in border border-gray-200"
      >
        <img
          src={imageUrl}
          alt="Ticket escaneado"
          className="w-full h-auto max-h-80 object-contain"
        />
        
        {/* Overlay con icono de zoom */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-colors flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        Click para ampliar
      </p>

      {/* Modal de zoom */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Imagen ampliada */}
          <img
            src={imageUrl}
            alt="Ticket escaneado"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}