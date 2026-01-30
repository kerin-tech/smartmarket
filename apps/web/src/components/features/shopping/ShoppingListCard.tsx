'use client';

import { ClipboardList, Copy, Trash2, Calendar, MoreVertical } from 'lucide-react';
import { useState, useRef } from 'react';
import type { ShoppingList } from '@/types/shoppingList.types';
import { getFrequencyLabel } from '@/types/shoppingList.types';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';

interface ShoppingListCardProps {
  list: ShoppingList;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ShoppingListCard({ list, onSelect, onDuplicate, onDelete }: ShoppingListCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const itemCount = list.items.length;
  const checkedCount = list.items.filter((i) => i.checked).length;
  const progress = itemCount > 0 ? Math.round((checkedCount / itemCount) * 100) : 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div
      className="group relative bg-card rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      {/* Menu Contextual */}
      <div className="absolute top-3 right-3">
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <DropdownMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          triggerRef={triggerRef}
          align="right"
        >
          <DropdownItem 
            icon={<Copy className="h-4 w-4" />} 
            onClick={() => { onDuplicate(); setIsMenuOpen(false); }}
          >
            Duplicar
          </DropdownItem>
          <DropdownItem 
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />} 
            onClick={() => { onDelete(); setIsMenuOpen(false); }}
          >
            Eliminar
          </DropdownItem>
        </DropdownMenu>
      </div>

      {/* Content: Icon & Name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <ClipboardList className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-semibold text-foreground truncate">{list.name}</h3>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      {itemCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-medium">{checkedCount} de {itemCount}</span>
            <span className="font-bold text-primary-600">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(var(--primary-500),0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(list.updatedAt)}</span>
        </div>
        
        {list.frequency && (
          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
            {getFrequencyLabel(list.frequency)}
          </span>
        )}
      </div>
    </div>
  );
}