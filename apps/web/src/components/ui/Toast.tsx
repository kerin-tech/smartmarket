'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastProps extends ToastData {
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

// Mapeo corregido basado en paletas semánticas estándar
const styles = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300',
};

const iconStyles = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-blue-500 dark:text-blue-400',
};

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id]); // Añadido id a dependencias por buena práctica

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 w-full max-w-sm p-4 rounded-lg border shadow-lg',
        'transition-all duration-300 ease-in-out',
        styles[type],
        isLeaving ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 animate-in slide-in-from-right-5'
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyles[type])} />
      <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-md text-current opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-focus"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastData[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-[calc(100vw-2rem)] sm:max-w-sm">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}