// apps/web/src/components/features/products/ProductCard.tsx
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { useState } from 'react';

interface Props { 
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between relative">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-xl">
          {product.category === 'Frutas' ? '🍎' : '📦'}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-500">{product.category} · {product.unit}</p>
        </div>
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <MoreVertical size={20} />
        </button>

        {/* Estado: Menú contextual abierto */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 animate-dropdownOpen">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Pencil size={16} /> Editar producto
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-main hover:bg-error-50">
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};