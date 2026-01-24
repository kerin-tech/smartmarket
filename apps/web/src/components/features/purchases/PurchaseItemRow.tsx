'use client';

import { Trash2, Tag, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import type { PurchaseItemFormData } from '@/types/purchase.types';
import { cn } from '@/lib/utils';

interface PurchaseItemRowProps {
  item: PurchaseItemFormData;
  onEdit: (item: PurchaseItemFormData) => void;
  onDelete: (tempId: string) => void;
}

export function PurchaseItemRow({ item, onEdit, onDelete }: PurchaseItemRowProps) {
  const baseSubtotal = item.quantity * item.unitPrice;
  const discountAmount = baseSubtotal * ((item.discountPercentage || 0) / 100);
  const finalSubtotal = baseSubtotal - discountAmount;
  
  // CORRECCIÓN: Obtener configuración y extraer el componente de Icono
  const config = item.product ? getCategoryConfig(item.product.category) : null;
  const CategoryIcon = config?.icon || ShoppingCart;

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary-200 transition-colors">
      {/* CORRECCIÓN: Renderizado de Icono dinámico */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
        <CategoryIcon className="h-5 w-5 text-primary-600" />
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
        <h4 className="text-sm font-medium text-foreground truncate">
          {item.product?.name || 'Producto'}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {item.quantity} × {formatCurrency(item.unitPrice)}
          </p>
          {item.discountPercentage && item.discountPercentage > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              <Tag className="w-3 h-3" />
              -{item.discountPercentage}%
            </span>
          ) : null}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-foreground">
          {formatCurrency(finalSubtotal)}
        </p>
        {item.discountPercentage && item.discountPercentage > 0 ? (
          <p className="text-[10px] text-muted-foreground line-through">
            {formatCurrency(baseSubtotal)}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => item.tempId && onDelete(item.tempId)}
        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}