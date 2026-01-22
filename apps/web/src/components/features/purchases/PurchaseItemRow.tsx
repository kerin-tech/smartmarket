// src/components/features/purchases/PurchaseItemRow.tsx

'use client';

import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';
import type { PurchaseItemFormData } from '@/types/purchase.types';

interface PurchaseItemRowProps {
  item: PurchaseItemFormData;
  onEdit: (item: PurchaseItemFormData) => void;
  onDelete: (tempId: string) => void;
}

export function PurchaseItemRow({ item, onEdit, onDelete }: PurchaseItemRowProps) {
  const subtotal = item.quantity * item.unitPrice;
  const categoryConfig = getCategoryConfig(item.product?.category || '');

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary-200">
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-lg">
        {categoryConfig.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
        <h4 className="text-sm font-medium text-secondary-900 truncate">
          {item.product?.name || 'Producto'}
        </h4>
        <p className="text-xs text-secondary-500">
          {item.quantity} × {formatCurrency(item.unitPrice)}
        </p>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-secondary-900">
          {formatCurrency(subtotal)}
        </p>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => item.tempId && onDelete(item.tempId)}
        className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        aria-label="Eliminar producto"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}