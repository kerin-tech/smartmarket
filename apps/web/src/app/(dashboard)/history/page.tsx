// src/app/(dashboard)/history/page.tsx

import { Metadata } from 'next';
import { HistoryView } from '@/components/features/history/HistoryView';

export const metadata: Metadata = {
  title: 'Historial | SmartMarket',
  description: 'Visualiza tu historial de gastos y análisis mensuales',
};

export default function HistoryPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <HistoryView />
    </div>
  );
}