'use client';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose: () => void;
}

const variantStyles = {
  success: {
    container: 'bg-green-50 border-l-green-600',
    icon: <CheckCircle2 className="text-green-600" size={20} />,
  },
  error: {
    container: 'bg-red-50 border-l-red-600',
    icon: <AlertCircle className="text-red-600" size={20} />,
  },
  warning: {
    container: 'bg-amber-50 border-l-amber-600',
    icon: <AlertTriangle className="text-amber-600" size={20} />,
  },
  info: {
    container: 'bg-blue-50 border-l-blue-600',
    icon: <Info className="text-blue-600" size={20} />,
  },
};

export const Toast = ({ 
  variant, 
  message, 
  action, 
  duration = 5000, 
  onClose 
}: ToastProps) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed z-[100] transition-all duration-300 pointer-events-none
      /* Mobile: Top Center */
      top-4 left-4 right-4 
      /* Desktop: Bottom Right */
      sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 sm:w-[400px]">
      
      <div className={`
        pointer-events-auto flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-lg
        animate-in slide-in-from-right-full duration-200
        ${variantStyles[variant].container}
      `}>
        {/* Icono de variante */}
        <div className="flex-shrink-0">
          {variantStyles[variant].icon}
        </div>

        {/* Mensaje */}
        <p className="flex-1 text-sm font-medium text-gray-900">
          {message}
        </p>

        {/* Acción (opcional) */}
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-bold text-primary-600 hover:underline px-2"
          >
            {action.label}
          </button>
        )}

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-black/5 p-1 rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};