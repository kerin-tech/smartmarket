// src/components/features/stores/StoreCard.tsx

'use client';

import { useRef } from 'react';
import { MoreVertical, Pencil, Trash2, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { useStoreStore } from '@/stores/store.store';
import type { Store } from '@/types/store.types';

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  searchQuery?: string;
}

export function StoreCard({ store, onEdit, onDelete, searchQuery }: StoreCardProps) {
  const { menuOpenForId, openMenu, closeMenu } = useStoreStore();
  const isMenuOpen = menuOpenForId === store.id;
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Resaltar texto de búsqueda
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning-200 text-warning-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-card hover:bg-muted transition-colors">
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
        <span className="text-xl">🏪</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">
          {highlightText(store.name, searchQuery || '')}
        </h3>
        {store.location ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {highlightText(store.location, searchQuery || '')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">Sin ubicación</p>
        )}
      </div>

      {/* Menu button */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            isMenuOpen ? closeMenu() : openMenu(store.id);
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
          aria-label={`Opciones para ${store.name}`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        <DropdownMenu 
          isOpen={isMenuOpen} 
          onClose={closeMenu}
          triggerRef={triggerRef}
        >
          <DropdownItem 
            onClick={() => {
              closeMenu();
              onEdit(store);
            }}
            icon={<Pencil className="h-4 w-4" />}
          >
            Editar
          </DropdownItem>
          <DropdownItem 
            onClick={() => {
              closeMenu();
              onDelete(store);
            }}
            icon={<Trash2 className="h-4 w-4" />}
            variant="danger"
          >
            Eliminar
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>
  );
}