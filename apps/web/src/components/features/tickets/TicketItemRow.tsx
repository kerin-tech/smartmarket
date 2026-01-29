'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X, Link as LinkIcon, ChevronDown, Plus, Sparkles, Undo2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SearchProductModal } from './SearchProductModal';
import { formatCurrency } from '@/utils/formatters';

import type { EditableItem, ProductMatch } from '@/types/ticket.types';

const CATEGORIES = [
  'Frutas', 'Verduras', 'Granos', 'Lácteos', 'Carnes', 'Bebidas',
  'Limpieza', 'Otros', 'Despensa', 'Panadería', 'Pescados',
  'Huevos', 'Licores', 'Cuidado Personal', 'Mascotas', 'Bebés', 'Congelados'
];

interface TicketItemRowProps {
  item: EditableItem;
  onUpdate: (updates: Partial<EditableItem>) => void;
  onSelectMatch: (match: ProductMatch | null) => void;
  onDelete: () => void;
}

export function TicketItemRow({ item, onUpdate, onSelectMatch, onDelete }: TicketItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editValues, setEditValues] = useState({
    detected_name: item.detected_name,
    detected_price: item.detected_price,
    detected_quantity: item.detected_quantity,
    detected_category: item.detected_category,
    has_discount: item.has_discount || false,
    original_price: item.original_price || (item.has_discount ? item.detected_price : 0),
    discount_percentage: item.discount_percentage || 0,
  });

  const subtotal = item.detected_price * item.detected_quantity;
  const savings = item.has_discount && item.original_price && item.original_price > item.detected_price
    ? (item.original_price - item.detected_price) * item.detected_quantity 
    : 0;
  
  const allMatches = [
    ...(item.match ? [item.match] : []),
    ...item.suggestions.filter(s => s.product_id !== item.match?.product_id)
  ];

  const handleOriginalPriceChange = (val: number) => {
    const original = val;
    const final = editValues.detected_price;
    let discountPct = 0;
    
    if (original > 0 && final > 0 && original > final) {
      discountPct = Math.round(((original - final) / original) * 100);
    }
    
    setEditValues(v => ({ 
      ...v, 
      original_price: original,
      discount_percentage: discountPct,
    }));
  };

  const handleFinalPriceChange = (val: number) => {
    const original = editValues.original_price;
    const final = val;
    let discountPct = 0;
    
    if (original > 0 && final > 0 && original > final) {
      discountPct = Math.round(((original - final) / original) * 100);
    }
    
    setEditValues(v => ({ 
      ...v, 
      detected_price: final,
      discount_percentage: discountPct,
    }));
  };

  const handleDiscountToggle = (checked: boolean) => {
    if (checked) {
      setEditValues(v => ({
        ...v,
        has_discount: true,
        original_price: v.original_price > 0 ? v.original_price : v.detected_price,
        discount_percentage: 0
      }));
    } else {
      setEditValues(v => ({
        ...v,
        has_discount: false,
        original_price: 0,
        discount_percentage: 0
      }));
    }
  };

  const handleSave = () => {
    let finalDiscountPercentage = 0;
    const original = Number(editValues.original_price);
    const final = Number(editValues.detected_price);
    
    if (editValues.has_discount && original > 0 && final > 0 && original > final) {
      finalDiscountPercentage = Math.round(((original - final) / original) * 100);
    }

    onUpdate({
      detected_name: editValues.detected_name,
      detected_price: final,
      detected_quantity: Number(editValues.detected_quantity),
      detected_category: editValues.detected_category,
      has_discount: editValues.has_discount && finalDiscountPercentage > 0,
      original_price: editValues.has_discount ? original : undefined,
      discount_percentage: finalDiscountPercentage,
      discount_amount: editValues.has_discount && original > final 
        ? original - final
        : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      detected_name: item.detected_name,
      detected_price: item.detected_price,
      detected_quantity: item.detected_quantity,
      detected_category: item.detected_category,
      has_discount: item.has_discount || false,
      original_price: item.original_price || 0,
      discount_percentage: item.discount_percentage || 0,
    });
    setIsEditing(false);
  };

  const handleSearchProduct = (match: ProductMatch) => {
    onSelectMatch(match);
    setShowSearchModal(false);
  };

  const getMatchLevelColor = (level: string, confidence: number) => {
    if (level === 'high' || confidence >= 0.7) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800';
    if (level === 'medium' || confidence >= 0.4) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  // Item eliminado (soft delete)
  if (item.isDeleted) {
    return (
      <div className="px-4 py-3 bg-muted/50 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">{item.detected_name}</span>
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full">
              Eliminado
            </span>
          </div>
          <button
            onClick={() => onUpdate({ isDeleted: false })}
            className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            <Undo2 className="h-3 w-3" />
            Restaurar
          </button>
        </div>
      </div>
    );
  }

  // Modo edición
  if (isEditing) {
    return (
      <div className="px-4 py-4 space-y-4 bg-muted/30">
        <Input
          label="Nombre"
          value={editValues.detected_name}
          onChange={(e) => setEditValues(v => ({ ...v, detected_name: e.target.value }))}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cantidad"
            type="number"
            step="0.01"
            value={editValues.detected_quantity}
            onChange={(e) => setEditValues(v => ({ ...v, detected_quantity: Number(e.target.value) }))}
          />
          <Select
            label="Categoría"
            value={editValues.detected_category}
            onChange={(e) => setEditValues(v => ({ ...v, detected_category: e.target.value }))}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />
        </div>

        {/* Sección de descuento */}
        <div className="p-3 border border-border rounded-lg space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={editValues.has_discount}
              onChange={(e) => handleDiscountToggle(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">¿Tiene descuento?</span>
          </label>

          {editValues.has_discount ? (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <Input
                label="Precio lista (original)"
                type="number"
                value={editValues.original_price}
                onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
              />
              <Input
                label="Precio final (con dto)"
                type="number"
                value={editValues.detected_price}
                onChange={(e) => handleFinalPriceChange(Number(e.target.value))}
              />
            </div>
          ) : (
            <Input
              label="Precio unitario"
              type="number"
              value={editValues.detected_price}
              onChange={(e) => setEditValues(v => ({ ...v, detected_price: Number(e.target.value) }))}
            />
          )}

          {editValues.has_discount && editValues.discount_percentage > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Descuento calculado:</span>
              <span className="font-medium text-green-600 dark:text-green-400">-{editValues.discount_percentage}%</span>
            </div>
          )}
        </div>

        {/* Botones de acción en modo edición */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
        {/* Info principal */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground">{item.detected_name}</p>
              
              {item.selected_match ? (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <LinkIcon className="h-3 w-3" />
                  Vinculado
                </span>
              ) : item.match?.match_level === 'medium' ? (
                <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Sugerencia
                </span>
              ) : item.match?.match_level === 'high' ? (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  Match alto
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  <Plus className="h-3 w-3" />
                  Nuevo
                </span>
              )}

              {item.has_discount && item.discount_percentage && item.discount_percentage > 0 && (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                  -{item.discount_percentage}%
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted rounded text-xs">{item.detected_category}</span>
              <span>•</span>
              <span>{item.detected_quantity} × {formatCurrency(item.detected_price)}</span>
              {item.has_discount && item.original_price && (
                <span className="line-through text-xs">{formatCurrency(item.original_price)}</span>
              )}
            </div>

            {/* Producto vinculado o selector */}
            <div className="mt-2">
              {item.selected_match ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">{item.selected_match.name}</span>
                  <span className="text-xs text-green-600 dark:text-green-400">({Math.round(item.selected_match.confidence * 100)}%)</span>
                  <button
                    onClick={() => setShowMatchSelector(!showMatchSelector)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline ml-1 font-medium"
                  >
                    Cambiar
                  </button>
                </div>
              ) : allMatches.length > 0 ? (
                <button
                  onClick={() => setShowMatchSelector(!showMatchSelector)}
                  className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  <Sparkles className="h-3 w-3" />
                  Ver {allMatches.length} sugerencia{allMatches.length > 1 ? 's' : ''}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showMatchSelector && "rotate-180")} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Se creará como producto nuevo
                  </span>
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <Search className="h-3 w-3" />
                    Buscar producto
                  </button>
                </div>
              )}
            </div>

            {/* Selector de matches */}
            {showMatchSelector && (
              <div className="mt-2 bg-muted/50 rounded-lg p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {allMatches.map((match) => (
                  <button
                    key={match.product_id}
                    onClick={() => {
                      onSelectMatch(match);
                      setShowMatchSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md text-left text-sm transition-colors",
                      item.selected_match?.product_id === match.product_id
                        ? "bg-green-100 border border-green-200 dark:bg-green-950/30 dark:border-green-800"
                        : "hover:bg-muted"
                    )}
                  >
                    <div>
                      <p className="font-medium">{match.name}</p>
                      <p className="text-xs text-muted-foreground">{match.category}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      getMatchLevelColor(match.match_level, match.confidence)
                    )}>
                      {Math.round(match.confidence * 100)}%
                    </span>
                  </button>
                ))}
                
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors hover:bg-muted text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                  Buscar otro producto
                </button>
                
                <button
                  onClick={() => {
                    onSelectMatch(null);
                    setShowMatchSelector(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors",
                    item.selected_match === null
                      ? "bg-blue-100 border border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Crear como producto nuevo
                </button>
              </div>
            )}
          </div>

          {/* Subtotal y ahorro */}
          <div className="text-right flex-shrink-0">
            <span className="font-semibold text-foreground whitespace-nowrap">
              {formatCurrency(subtotal)}
            </span>
            {savings > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Ahorro: {formatCurrency(savings)}
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex-1"
            leftIcon={<Pencil className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SearchProductModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectProduct={handleSearchProduct}
      />
    </>
  );
}