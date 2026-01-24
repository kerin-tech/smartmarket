// src/components/ui/FilterSelect.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  emoji?: string;
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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary-300 bg-card',
          'text-sm font-medium transition-colors',
          'hover:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
          isOpen && 'border-primary-500 ring-2 ring-primary-500/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedOption?.emoji && <span>{selectedOption.emoji}</span>}
        <span className="text-foreground">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-1 w-full min-w-[200px] bg-card rounded-lg border border-color shadow-lg py-1 animate-scale-in"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors',
                option.value === value 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                {option.emoji && <span>{option.emoji}</span>}
                <span>{option.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {option.count !== undefined && (
                  <span className="text-muted-foreground">({option.count})</span>
                )}
                {option.value === value && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
