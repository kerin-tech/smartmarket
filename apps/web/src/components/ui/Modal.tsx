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

  return (
    /* !mt-0 anula el espacio del padre. items-start en mobile para que pegue arriba */
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start sm:justify-center overflow-y-auto !mt-0">
      
      {/* Backdrop Original (Sin blur) */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container - Sin padding en mobile para ocupar todo el ancho */}
      <div className="relative z-10 flex min-h-full w-full items-start sm:items-center justify-center p-0 sm:p-4">
        
        {/* Modal Card */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={cn(
            'relative w-full bg-card text-foreground flex flex-col transform transition-all',
            // MOBILE: Full screen, sin bordes exteriores, color sólido (bg-card ya lo tiene)
            'min-h-screen sm:min-h-0 border-0 sm:border border-border rounded-none sm:rounded-xl shadow-2xl',
            // DESKTOP: Animación y margen original
            'animate-scale-in sm:my-8', 
            sizes[size]
          )}
        >
          {/* Header - Solo esta línea de borde se mantiene en mobile */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content con Scroll Interno */}
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