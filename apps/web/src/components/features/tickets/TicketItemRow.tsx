// src/components/features/tickets/TicketItemRow.tsx

'use client';

import { useState } from 'react';
import type { TicketScanItem } from '@/types/ticket.types';
import { cn } from '@/lib/utils';

interface EditedItem {
  detectedName: string;
  detectedPrice: number | null;
  detectedQuantity: number;
  status: 'MATCHED' | 'NEW' | 'IGNORED' | 'PENDING';
  matchedProductId: string | null;
}

interface TicketItemRowProps {
  item: TicketScanItem;
  isIgnored: boolean;
  onChange: (changes: Partial<EditedItem>) => void;
  onIgnore: () => void;
  onRestore: () => void;
}

export function TicketItemRow({
  item,
  isIgnored,
  onChange,
  onIgnore,
  onRestore,
}: TicketItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig: Record<string, { label: string; color: string }> = {
    MATCHED: { label: 'Coincide', color: 'bg-green-100 text-green-700' },
    PENDING: { label: 'Revisar', color: 'bg-yellow-100 text-yellow-700' },
    NEW: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
    IGNORED: { label: 'Ignorado', color: 'bg-gray-100 text-gray-500' },
    CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  };

  const status = statusConfig[item.status] || statusConfig.NEW;

  // Item ignorado - vista compacta
  if (isIgnored) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 line-through">{item.detectedName}</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs', status.color)}>
              {status.label}
            </span>
          </div>
          <button
            onClick={onRestore}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Restaurar
          </button>
        </div>
      </div>
    );
  }

  // Item activo - vista expandible
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="p-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className={cn('px-2 py-0.5 rounded-full text-xs whitespace-nowrap', status.color)}>
            {status.label}
          </span>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{item.detectedName}</p>
            {item.matchedProduct && (
              <p className="text-xs text-green-600 truncate">
                {'-> '}{item.matchedProduct.name}
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="font-medium text-gray-900">
              ${(item.detectedPrice || 0).toLocaleString('es-CO')}
            </p>
            {item.detectedQuantity !== 1 && (
              <p className="text-xs text-gray-500">
                {item.detectedQuantity < 1 
                  ? `${item.detectedQuantity} kg × ${((item.detectedPrice || 0) / item.detectedQuantity).toLocaleString('es-CO', { maximumFractionDigits: 0 })}/kg`
                  : `${item.detectedQuantity} × ${((item.detectedPrice || 0) / item.detectedQuantity).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
                }
              </p>
            )}
          </div>

          <svg
            className={cn('w-5 h-5 text-gray-400 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-3">
          <p className="text-xs text-gray-400 font-mono truncate">
            Original: {item.rawText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                value={item.detectedName}
                onChange={(e) => onChange({ detectedName: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
              <input
                type="number"
                value={item.detectedPrice || ''}
                onChange={(e) => onChange({ detectedPrice: Number(e.target.value) || null })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                step="0.001"
                value={item.detectedQuantity}
                onChange={(e) => onChange({ detectedQuantity: Number(e.target.value) || 1 })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {item.suggestions.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Es alguno de estos productos?
              </label>
              <div className="flex flex-wrap gap-2">
                {item.suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ matchedProductId: suggestion.id, status: 'MATCHED' });
                    }}
                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {suggestion.name}
                    <span className="ml-1 text-gray-400">
                      ({Math.round(suggestion.similarity * 100)}%)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onIgnore();
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Ignorar producto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}