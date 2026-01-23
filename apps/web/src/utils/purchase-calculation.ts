// utils/purchase-calculations.ts
import { Purchase } from '@/types/purchase.types';

export function getPurchaseCalculations(purchase: Purchase) {
  // 1. Calculamos el ahorro sumando los descuentos de cada item
  const savings = purchase.items.reduce((acc, item) => {
    const base = item.quantity * item.unitPrice;
    const discount = base * ((item.discountPercentage || 0) / 100);
    return acc + discount;
  }, 0);

  // 2. El totalBase es el total pagado + lo que se ahorró
  const totalBase = purchase.total + savings;

  // 3. Porcentaje de ahorro efectivo
  const effectivePercentage = totalBase > 0 
    ? Math.round((savings / totalBase) * 100) 
    : 0;

  return {
    savings,
    totalBase,
    effectivePercentage
  };
}