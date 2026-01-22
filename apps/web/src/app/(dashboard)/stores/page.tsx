// src/app/(dashboard)/stores/page.tsx

import { Metadata } from 'next';
import { StoreList } from '@/components/features/stores/StoreList';

export const metadata: Metadata = {
  title: 'Mis Locales | SmartMarket',
  description: 'Gestiona los locales donde realizas tus compras',
};

export default function StoresPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <StoreList />
    </div>
  );
}