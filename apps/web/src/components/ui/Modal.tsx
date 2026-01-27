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
    /* Agregamos !mt-0 para matar el margen del space-y-8 del padre */
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto !mt-0">
      {/* Backdrop Original (Solo bg-black/60, sin blur) */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container - En mobile ocupa todo, en desktop centra con p-4 */}
      <div className="relative z-10 flex min-h-full w-full items-center justify-center p-0 sm:p-4">
        
        {/* Modal Card */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={cn(
            'relative w-full bg-card text-foreground shadow-2xl transform transition-all',
            'text-left border border-border flex flex-col',
            // MOBILE: Full screen, no borders
            'min-h-screen sm:min-h-0 rounded-none sm:rounded-xl',
            // DESKTOP: Animación y tamaños originales
            'animate-scale-in sm:my-8', 
            sizes[size]
          )}
        >
          {/* Header Original */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content con Scroll Interno (para que el Header no se vaya en mobile) */}
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