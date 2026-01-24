'use client';

import { useRef } from 'react';
import { MoreVertical, Pencil, Trash2, MapPin, Tag } from 'lucide-react';
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

  // --- LÓGICA DE CÁLCULO LOCAL (FRONTEND ONLY) ---
  // Calculamos el ahorro sumando lo que se descontó en cada item
  const totalSavings = purchase.items?.reduce((acc, item) => {
    const base = item.quantity * item.unitPrice;
    const discount = base * ((item.discountPercentage || 0) / 100);
    return acc + discount;
  }, 0) || 0;

  // El total base es lo que se pagó + lo que se ahorró
  const totalBase = purchase.total + totalSavings;
  
  const hasDiscount = totalSavings > 0;
  
  // Porcentaje de ahorro efectivo sobre el total de la factura
  const effectiveSavingsPercentage = hasDiscount && totalBase > 0
    ? Math.round((totalSavings / totalBase) * 100)
    : 0;
  // -----------------------------------------------

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b border-color last:border-0">
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
          <h3 className="text-base font-semibold text-foreground truncate">
            {purchase.store.name}
          </h3>
          {hasDiscount && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
              <Tag className="h-2.5 w-2.5" />
              {effectiveSavingsPercentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground capitalize">
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
        <div className="text-right min-w-[100px]">
          <p className="text-base font-semibold text-foreground">
            {formatCurrency(purchase.total)}
          </p>
          {hasDiscount ? (
            <p className="text-[10px] font-bold text-green-600">
              Ahorraste {formatCurrency(totalSavings)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {purchase.itemCount} {purchase.itemCount === 1 ? 'producto' : 'productos'}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            ref={triggerRef}
            onClick={(e) => {
              e.stopPropagation();
              isMenuOpen ? closeMenu() : setOpenMenuId(purchase.id);
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
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
                onEdit(purchase);
              }}
              icon={<Pencil className="h-4 w-4" />}
            >
              Editar
            </DropdownItem>
            <DropdownItem 
              onClick={() => {
                closeMenu();
                onDelete(purchase);
              }}
              icon={<Trash2 className="h-4 w-4" />}
              variant="danger"
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}