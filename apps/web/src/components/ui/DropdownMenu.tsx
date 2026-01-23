// src/components/ui/DropdownMenu.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function DropdownMenu({ 
  isOpen, 
  onClose, 
  children, 
  align = 'right',
  className,
  triggerRef,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  // Esperar a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular posición del menú basándose en el trigger
  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const menuWidth = 160; // min-w-[160px]
      
      let left = align === 'right' 
        ? triggerRect.right - menuWidth 
        : triggerRect.left;
      
      // Asegurar que no se salga de la pantalla
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      setPosition({
        top: triggerRect.bottom + 4,
        left,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, triggerRef, align]);

  // Cerrar al hacer click fuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !mounted) return null;

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className={cn(
        'min-w-[160px] bg-white rounded-lg border border-secondary-200 shadow-lg py-1 animate-scale-in',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );

  // Renderizar en un portal fuera del árbol DOM del card
  return createPortal(menuContent, document.body);
}

interface DropdownItemProps {
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export function DropdownItem({ 
  onClick, 
  icon, 
  children, 
  variant = 'default',
  disabled = false 
}: DropdownItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors',
        variant === 'default' && 'text-secondary-700 hover:bg-secondary-50',
        variant === 'danger' && 'text-error-600 hover:bg-error-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}