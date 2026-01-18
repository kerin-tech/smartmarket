import { Package, Plus } from 'lucide-react';

export const ProductEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in text-center">
    <div className="bg-gray-100 p-6 rounded-full mb-6">
      <Package size={48} className="text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes productos</h3>
    <p className="text-gray-500 max-w-xs mb-8">
      Registra los productos que sueles comprar para empezar a comparar precios y ahorrar.
    </p>
    <button className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-primary">
      <Plus size={20} />
      Agregar mi primer producto
    </button>
  </div>
);
