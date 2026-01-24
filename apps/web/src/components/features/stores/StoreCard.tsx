'use client';

import { useRef } from 'react';
import { MoreVertical, Pencil, Trash2, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { useStoreStore } from '@/stores/store.store';
import { getStoreIcon } from '@/types/store.types';
import type { Store } from '@/types/store.types';
import { cn } from '@/lib/utils';

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

  // Obtenemos el icono dinámico y su color quemado
  const { icon: Icon, color } = getStoreIcon(store.name);

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
    <div 
      onClick={() => onEdit(store)}
      className="flex items-center gap-3 p-4 bg-card hover:bg-muted transition-colors cursor-pointer group"
    >
      {/* Icono: Medidas y estilos iguales al anterior (w-10 h-10, rounded-lg) */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
        "bg-primary-100 group-hover:bg-primary-200"
      )}>
        <Icon 
          className={cn("h-5 w-5", color)} 
          strokeWidth={2}
        />
      </div>

      {/* Info: Tipografía y colores iguales al anterior */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary-700 transition-colors">
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
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
          aria-label={`Opciones para ${store.name}`}
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        <DropdownMenu isOpen={isMenuOpen} onClose={closeMenu} triggerRef={triggerRef}>
          <DropdownItem 
            onClick={() => { closeMenu(); onEdit(store); }}
            icon={<Pencil className="h-4 w-4" />}
          >
            Editar
          </DropdownItem>
          <DropdownItem 
            onClick={() => { closeMenu(); onDelete(store); }}
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