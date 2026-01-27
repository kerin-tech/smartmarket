// src/components/ui/ConfirmModal.tsx

'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  variant = 'danger',
}: ConfirmModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="sm" 
      variant="dialog" // <--- Solo esto para que sea flotante en mobile
    >
      <div className="flex gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-red-500' : 'bg-warning-100'
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${
              variant === 'danger' ? 'text-red-100' : 'text-warning-600'
            }`}
          />
        </div>
        <div className="flex items-center">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}