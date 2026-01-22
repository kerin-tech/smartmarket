// src/app/(dashboard)/purchases/page.tsx

import { Metadata } from 'next';
import { PurchaseList } from '@/components/features/purchases/PurchaseList';

export const metadata: Metadata = {
  title: 'Mis Compras | SmartMarket',
  description: 'Registra y gestiona tus compras para comparar precios',
};

export default function PurchasesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PurchaseList />
    </div>
  );
}