// src/app/(dashboard)/purchases/lists/page.tsx

import { ShoppingListView } from '@/components/features/shopping/ShoppingListView';

export const metadata = {
  title: 'Listas de Compras | SmartMarket',
  description: 'Organiza tus compras por tienda y categoría',
};

export default function ShoppingListsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ShoppingListView />
    </div>
  );
}