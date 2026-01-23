// src/components/features/purchases/PurchaseItemRow.tsx
'use client';

import { Trash2, Tag } from 'lucide-react'; // Añadimos Tag para resaltar el descuento
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import type { PurchaseItemFormData } from '@/types/purchase.types';

interface PurchaseItemRowProps {
  item: PurchaseItemFormData;
  onEdit: (item: PurchaseItemFormData) => void;
  onDelete: (tempId: string) => void;
}

export function PurchaseItemRow({ item, onEdit, onDelete }: PurchaseItemRowProps) {
  // CÁLCULO: Precio Base vs Precio con Descuento
  const baseSubtotal = item.quantity * item.unitPrice;
  const discountAmount = baseSubtotal * ((item.discountPercentage || 0) / 100);
  const finalSubtotal = baseSubtotal - discountAmount;
  
  const emoji = item.product ? getCategoryConfig(item.product.category).emoji : '🛒';

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary-200 hover:border-primary-200 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-lg">
        {emoji}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
        <h4 className="text-sm font-medium text-secondary-900 truncate">
          {item.product?.name || 'Producto'}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-xs text-secondary-500">
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
        <p className="text-sm font-bold text-secondary-900">
          {formatCurrency(finalSubtotal)}
        </p>
        {item.discountPercentage && item.discountPercentage > 0 ? (
          <p className="text-[10px] text-secondary-400 line-through">
            {formatCurrency(baseSubtotal)}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => item.tempId && onDelete(item.tempId)}
        className="p-2 text-secondary-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}