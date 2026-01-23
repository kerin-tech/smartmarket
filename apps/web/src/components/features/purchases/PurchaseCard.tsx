// src/components/features/purchases/PurchaseCard.tsx

'use client';

import { useRef } from 'react';
import { MoreVertical, Pencil, Trash2, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { usePurchaseStore } from '@/stores/purchase.store';
import { formatCurrency } from '@/utils/formatters';
import type { Purchase } from '@/types/purchase.types';

interface PurchaseCardProps {
  purchase: Purchase;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
  searchQuery?: string;
}

function formatDateLong(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function PurchaseCard({ purchase, onEdit, onDelete, searchQuery }: PurchaseCardProps) {
  const { openMenuId, setOpenMenuId, closeMenu } = usePurchaseStore();
  const isMenuOpen = openMenuId === purchase.id;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleEdit = () => {
    closeMenu();
    onEdit(purchase);
  };

  const handleDelete = () => {
    closeMenu();
    onDelete(purchase);
  };

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-secondary-50 transition-colors">
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
        <MapPin className="h-5 w-5 text-primary-600" />
      </div>

      {/* Content */}
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit(purchase)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-secondary-900 truncate">
            {purchase.store.name}
          </h3>
        </div>
        <p className="text-sm text-secondary-500 capitalize">
          {formatDateLong(purchase.date)}
        </p>
        {searchQuery && (
          <p className="text-xs text-primary-600 mt-0.5">
            Coincide con tu búsqueda
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-base font-semibold text-secondary-900">
            {formatCurrency(purchase.total)}
          </p>
          <p className="text-sm text-secondary-500">
            {purchase.itemCount} {purchase.itemCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        {/* Menu trigger */}
        <button
          ref={triggerRef}
          onClick={() => setOpenMenuId(isMenuOpen ? null : purchase.id)}
          className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
          aria-label="Opciones"
        >
          <MoreVertical className="h-5 w-5 text-secondary-400" />
        </button>

        {/* Dropdown Menu */}
        <DropdownMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          triggerRef={triggerRef}
          align="right"
        >
          <DropdownItem onClick={handleEdit} icon={<Pencil className="h-4 w-4" />}>
            Editar
          </DropdownItem>
          <DropdownItem onClick={handleDelete} icon={<Trash2 className="h-4 w-4" />} variant="danger">
            Eliminar
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>
  );
}