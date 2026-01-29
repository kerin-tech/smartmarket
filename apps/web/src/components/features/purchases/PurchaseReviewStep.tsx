// src/components/features/purchases/PurchaseReviewStep.tsx
import { Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatters';
import { getCategoryConfig } from '@/types/product.types';

interface PurchaseReviewStepProps {
  items: any[];
  onUpdateItem: (index: number, updates: any) => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PurchaseReviewStep({ items, onUpdateItem, onRemoveItem, onConfirm, onCancel }: PurchaseReviewStepProps) {
  const total = items.reduce((sum, item) => sum + (item.detected_price * item.detected_quantity), 0);

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3 border border-primary/10">
        <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-primary-900">Revisa tu ticket</h4>
          <p className="text-xs text-primary-700">La IA extrajo estos productos. Puedes editarlos si algo no es correcto.</p>
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
        {items.map((item, idx) => {
          const config = getCategoryConfig(item.detected_category);
          const CategoryIcon = config.icon;

          return (
            <div key={idx} className="p-3 bg-white border border-border rounded-xl shadow-sm space-y-3">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg ${config.color.replace('text', 'bg')}/10 flex items-center justify-center flex-shrink-0`}>
                  <CategoryIcon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <Input 
                    value={item.detected_name}
                    onChange={(e) => onUpdateItem(idx, { detected_name: e.target.value })}
                    className="h-8 text-sm font-medium border-none p-0 focus-visible:ring-0"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {item.detected_category}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemoveItem(idx)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase">Cantidad</label>
                  <Input 
                    type="number"
                    value={item.detected_quantity}
                    onChange={(e) => onUpdateItem(idx, { detected_quantity: Number(e.target.value) })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase">Precio Unit.</label>
                  <Input 
                    type="number"
                    value={item.detected_price}
                    onChange={(e) => onUpdateItem(idx, { detected_price: Number(e.target.value) })}
                    className="h-8 font-bold"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-muted rounded-xl flex justify-between items-center">
        <span className="font-medium">Total detectado:</span>
        <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Descartar</Button>
        <Button onClick={onConfirm} className="flex-1">Importar Todo</Button>
      </div>
    </div>
  );
}