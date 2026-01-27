// src/components/ui/Modal.tsx

'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  variant?: 'form' | 'dialog'; // <--- Nueva prop para controlar el comportamiento
}

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  variant = 'form', // Por defecto es tipo formulario (Full screen mobile)
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Clases dinámicas según la variante
  const isDialog = variant === 'dialog';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto !mt-0">
      
      {/* Backdrop (Sin blur) */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container dinámico */}
      <div className={cn(
        "relative z-10 flex min-h-full w-full items-center justify-center transition-all",
        isDialog ? "p-4" : "p-0 sm:p-4" // Si es diálogo, siempre tiene padding
      )}>
        
        {/* Modal Card */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative w-full bg-card text-foreground flex flex-col transform transition-all shadow-2xl',
            'animate-scale-in',
            
            // Lógica de bordes y dimensiones según variante
            isDialog 
              ? 'rounded-xl border border-border h-auto max-w-[90vw]' // Siempre flotante
              : 'min-h-screen sm:min-h-0 rounded-none sm:rounded-xl border-0 sm:border border-border', // Full screen en mobile si es form
            
            sizes[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-end gap-3 pt-4 mt-4 border-t border-border',
        className
      )}
    >
      {children}
    </div>
  );
}