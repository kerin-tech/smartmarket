'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: LucideIcon; // Cambiado de emoji a icon para consistencia
}

interface FilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Filtrar',
  className 
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const Icon = selectedOption?.icon;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border bg-card',
          'text-sm font-medium transition-all w-full sm:w-auto min-w-[140px]',
          'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
          isOpen && 'border-primary ring-2 ring-primary/20'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-foreground truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform shrink-0',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown - CORRECCIÓN DE POSICIONAMIENTO */}
      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 w-full min-w-[200px] bg-card rounded-xl border border-border shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-200",
            "right-0 origin-top-right" // Se ancla a la derecha y crece hacia la izquierda
          )}
          role="listbox"
        >
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors',
                    option.value === value 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {OptionIcon && <OptionIcon className={cn("h-4 w-4", option.value === value ? "text-primary" : "text-muted-foreground")} />}
                    <span>{option.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {option.count !== undefined && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full",
                        option.value === value ? "bg-primary-100 text-primary-600" : "bg-muted text-muted-foreground"
                      )}>
                        {option.count}
                      </span>
                    )}
                    
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}