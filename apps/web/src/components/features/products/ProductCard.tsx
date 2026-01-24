// src/components/features/products/ProductCard.tsx

'use client';

import { useRef } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { useProductStore } from '@/stores/product.store';
import type { Product } from '@/types/product.types';
import { getCategoryConfig } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  searchQuery?: string;
}

export function ProductCard({ product, onEdit, onDelete, searchQuery }: ProductCardProps) {
  const { menuOpenForId, openMenu, closeMenu } = useProductStore();
  const isMenuOpen = menuOpenForId === product.id;
  const config = getCategoryConfig(product.category);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
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
      onClick={() => onEdit(product)} // <-- Click en la tarjeta para editar
      className="flex items-center gap-3 p-4 bg-card hover:bg-muted transition-colors cursor-pointer group"
    >
      {/* Emoji/Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
        {config.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {highlightText(product.name, searchQuery || '')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {config.label}
          {product.brand && ` · ${product.brand}`}
        </p>
      </div>

      {/* Menu button */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            isMenuOpen ? closeMenu() : openMenu(product.id);
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
          aria-label={`Opciones para ${product.name}`}
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
              onEdit(product);
            }}
            icon={<Pencil className="h-4 w-4" />}
          >
            Editar
          </DropdownItem>
          <DropdownItem 
            onClick={() => {
              closeMenu();
              onDelete(product);
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