// src/components/ui/Popover.tsx
'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Popover({ trigger, children, className }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 z-50 min-w-[200px] origin-top-right",
            "bg-card text-card-foreground border border-border rounded-2xl shadow-2xl",
            "animate-in fade-in zoom-in-95 duration-100 p-1.5",
            className
          )}
        >
          {/* Pequeña flecha visual */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-card border-t border-l border-border rotate-45" />
          <div className="relative bg-card rounded-xl">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}