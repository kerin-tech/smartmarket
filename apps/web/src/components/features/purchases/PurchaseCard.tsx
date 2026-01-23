// src/components/features/purchases/PurchaseCard.tsx

'use client';

import { MoreVertical, Pencil, Trash2, MapPin } from 'lucide-react';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
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

  const menuItems = [
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => {
        closeMenu();
        onEdit(purchase);
      },
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => {
        closeMenu();
        onDelete(purchase);
      },
      variant: 'danger' as const,
    },
  ];

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

        {/* Menu */}
        <DropdownMenu
          items={menuItems}
          isOpen={isMenuOpen}
          onToggle={() => setOpenMenuId(isMenuOpen ? null : purchase.id)}
          onClose={closeMenu}
          trigger={
            <button
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              aria-label="Opciones"
            >
              <MoreVertical className="h-5 w-5 text-secondary-400" />
            </button>
          }
        />
      </div>
    </div>
  );
}