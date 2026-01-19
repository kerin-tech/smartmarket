// src/app/(dashboard)/products/page.tsx

import { Metadata } from 'next';
import { ProductList } from '@/components/features/products/ProductList';

export const metadata: Metadata = {
  title: 'Mis Productos | SmartMarket',
  description: 'Gestiona los productos que compras frecuentemente',
};

export default function ProductsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProductList />
    </div>
  );
}