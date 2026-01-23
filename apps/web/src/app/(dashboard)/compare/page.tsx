// src/app/(dashboard)/compare/page.tsx

import { Metadata } from 'next';
import { CompareView } from '@/components/features/compare';

export const metadata: Metadata = {
  title: 'Comparar Precios | SmartMarket',
  description: 'Compara precios de productos entre diferentes locales',
};

export default function ComparePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CompareView />
    </div>
  );
}