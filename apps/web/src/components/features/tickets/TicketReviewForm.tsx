'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { storeService } from '@/services/store.service';
import { formatCurrency } from '@/utils/formatters';
import type { TicketScan, TicketScanItem } from '@/types/ticket.types';

interface TicketReviewFormProps {
  ticket: TicketScan;
  onConfirm: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TicketReviewForm({ 
  ticket, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: TicketReviewFormProps) {
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [items, setItems] = useState<TicketScanItem[]>(ticket.items);
  const [purchaseDate, setPurchaseDate] = useState(
    ticket.purchaseDate || new Date().toISOString().split('T')[0]
  );

  // Cargar tiendas y autodetectar match por nombre
  useEffect(() => {
    storeService.getAll({ limit: 100 }).then(res => {
      setStores(res.stores);
      if (ticket.detectedStore) {
        const match = res.stores.find(s => 
          s.name.toLowerCase().includes(ticket.detectedStore!.toLowerCase())
        );
        if (match) setStoreId(match.id);
      }
    });
  }, [ticket.detectedStore]);

  // Cálculo de total en tiempo real basado en la edición masiva
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + ((item.detectedPrice || 0) * (item.detectedQuantity || 1)), 0)
  , [items]);

  const handleItemChange = (idx: number, field: keyof TicketScanItem, value: string | number) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[75vh] lg:h-[80vh]">
      {/* COLUMNA IZQUIERDA: VISUALIZACIÓN DEL TICKET (STICKY) */}
      <div className="hidden lg:block w-5/12 bg-zinc-900 rounded-3xl overflow-hidden border border-border relative">
        <img 
          src={ticket.imageUrl} 
          className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity" 
          alt="Ticket original" 
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
           <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Tienda Detectada</p>
           <p className="text-white text-sm font-medium">{ticket.detectedStore || 'No identificada'}</p>
        </div>
      </div>

      {/* COLUMNA DERECHA: EDICIÓN Y VALIDACIÓN */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Encabezado de la Compra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Select 
            label="Tienda donde compraste" 
            options={stores.map(s => ({ value: s.id, label: s.name }))} 
            value={storeId} 
            onChange={(e) => setStoreId(e.target.value)} 
          />
          <Input 
            label="Fecha de la compra" 
            type="date" 
            value={purchaseDate} 
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        {/* Lista de Productos Detectados */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                item.status === 'MATCHED' 
                ? 'border-emerald-500/20 bg-emerald-500/5' 
                : 'bg-card border-border shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <input 
                    className="w-full font-bold bg-transparent border-none p-0 focus:ring-0 text-sm placeholder:text-muted-foreground"
                    value={item.detectedName}
                    onChange={(e) => handleItemChange(idx, 'detectedName', e.target.value)}
                    placeholder="Nombre del producto"
                  />
                  <div className="flex gap-2 mt-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                      item.status === 'MATCHED' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {item.status === 'MATCHED' ? 'Producto Encontrado' : 'Nuevo'}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0" 
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input 
                  label="Cant." 
                  type="number" 
                  value={item.detectedQuantity} 
                  onChange={(e) => handleItemChange(idx, 'detectedQuantity', Number(e.target.value))}
                  className="h-9 text-sm" 
                />
                <Input 
                  label="Precio Unit." 
                  type="number" 
                  value={item.detectedPrice || 0} 
                  onChange={(e) => handleItemChange(idx, 'detectedPrice', Number(e.target.value))}
                  className="h-9 text-sm" 
                />
                <Input 
                  label="% Dto" 
                  type="number" 
                  value={item.discountPercentage || 0} 
                  onChange={(e) => handleItemChange(idx, 'discountPercentage', Number(e.target.value))}
                  className="h-9 text-sm" 
                />
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-3xl border-zinc-200">
              <p className="text-muted-foreground text-sm">No hay productos para procesar</p>
            </div>
          )}
        </div>

        {/* Footer con Totales y Acción */}
        <div className="pt-6 border-t border-border mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total de la Compra</p>
            <p className="text-3xl font-black text-foreground">{formatCurrency(total)}</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 sm:flex-none"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => onConfirm({ storeId, date: purchaseDate, items, total })} 
              disabled={!storeId || items.length === 0 || isLoading}
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </span>
              ) : (
                'Guardar Compra'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}