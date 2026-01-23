// src/app/(dashboard)/dashboard/page.tsx

import { Metadata } from 'next';
import { DashboardView } from '@/components/features/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | SmartMarket',
  description: 'Tu resumen de gastos y estadísticas de mercado',
};

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardView />
    </div>
  );
}