import { TrendingUp, Award, TrendingDown, Minus } from 'lucide-react';
import { PriceHistoryItem } from '@/types/analytics.types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function PriceHistoryTimeline({ history }: { history: PriceHistoryItem[] }) {
  const finalPrices = history.map(item => item.finalPrice);
  const minPrice = Math.min(...finalPrices);
  const maxPrice = Math.max(...finalPrices);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-bold text-foreground">Historial de Precios</h3>
      </div>

      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-200 before:via-border before:to-transparent">
        {history.map((item, index) => {
          const isBest = item.finalPrice === minPrice;
          const isHighest = item.finalPrice === maxPrice;

          // Lógica de tendencia respecto a la compra anterior (index + 1 porque el array es descendente)
          const previousPurchase = history[index + 1];
          let TrendIcon = Minus;
          let trendColor = "text-muted-foreground";

          if (previousPurchase) {
            if (item.finalPrice < previousPurchase.finalPrice) {
              TrendIcon = TrendingDown;
              trendColor = "text-success-600";
            } else if (item.finalPrice > previousPurchase.finalPrice) {
              TrendIcon = TrendingUp;
              trendColor = "text-red-600";
            }
          }

          return (
            <div key={item.id} className="relative flex items-start gap-4 pl-0">
              {/* Indicador de Timeline */}
              <div className={`mt-1.5 w-10 h-10 rounded-full border-4 border-primary-100 dark:border-white/5 flex items-center justify-center z-10 shrink-0 ${
                index === 0 ? 'bg-primary-500 dark:bg-primary-100' : 'bg-primary-200 dark:bg-muted'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-white dark:bg-primary-600' : 'bg-primary-600 dark:bg-white'
                }`} />
              </div>

              {/* Caja de contenido */}
              <div className="flex-1 bg-muted/20 rounded-xl p-4 border border-border/40 hover:border-primary-200 transition-colors">
                <div className="flex items-start gap-3">
                  {/* ICONO DE TENDENCIA AL PRINCIPIO */}
                  <div className={`mt-1 p-1.5 rounded-lg bg-background border border-border/50 shrink-0 ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 flex justify-between items-start min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{item.storeName}</p>
                      <p className="text-[11px] text-muted-foreground">{item.date}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-foreground">
                        {formatCurrency(item.finalPrice)}
                      </p>

                      <div className="flex flex-wrap items-center justify-end gap-2 mt-1.5">
                        {/* Badge: Mejor Precio */}
                        {isBest && (
                          <span className="flex items-center gap-1 text-xs font-medium text-success-600 bg-success-100 px-1.5 py-0.5 rounded">
                            <Award className="h-3 w-3" />
                            Mejor
                          </span>
                        )}

                        {/* Badge: Precio más alto */}
                        {isHighest && history.length > 1 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-100 bg-red-800 px-1.5 py-0.5 rounded">
                            <TrendingUp className="h-3 w-3" />
                            Mas Caro
                          </span>
                        )}
                        
                        {/* Badge: Descuento aplicado */}
                        {item.discountPercentage > 0 && (
                          <span className="text-xs font-bold text-success-600 bg-success-100 px-1.5 py-0.5 rounded">
                            -{item.discountPercentage}%
                          </span>
                        )}

                        {/* Precio base tachado */}
                        {item.discountPercentage > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className="line-through">{formatCurrency(item.originalPrice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}