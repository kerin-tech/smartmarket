'use client';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque según el Design System */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />

      {/* Contenedor de la Modal */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-modalScale">
        {/* Header de la Modal: Sin espacios extraños */}
        <div className="flex items-center justify-between p-6 pb-2">
          {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};