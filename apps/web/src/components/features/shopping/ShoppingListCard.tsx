'use client';

import { ClipboardList, Copy, Trash2, Calendar, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import type { ShoppingList } from '@/types/shoppingList.types';
import { getFrequencyLabel } from '@/types/shoppingList.types';

interface ShoppingListCardProps {
  list: ShoppingList;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ShoppingListCard({ list, onSelect, onDuplicate, onDelete }: ShoppingListCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Menu */}
      <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-40 bg-card border border-border rounded-lg shadow-lg py-1">
              <button
                onClick={() => { onDuplicate(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Copy className="h-4 w-4" /> Duplicar
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Icon & Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <ClipboardList className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{list.name}</h3>
          <p className="text-sm text-muted-foreground">
            {itemCount} producto{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {itemCount > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{checkedCount} de {itemCount}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(list.updatedAt)}</span>
        </div>
        {list.frequency && (
          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
            {getFrequencyLabel(list.frequency)}
          </span>
        )}
      </div>
    </div>
  );
}