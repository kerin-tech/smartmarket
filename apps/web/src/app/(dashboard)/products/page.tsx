'use client';
import { useState, useMemo } from 'react';
import { Search, Filter, Plus, MoreVertical, Pencil, Trash2, Check, Package, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Modal, Toast, EmptyState } from '@/components/ui';

// Tipado básico
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  emoji: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Manzana Roja', category: 'Frutas', brand: 'Local', unit: 'kg', emoji: '🍎' },
  { id: '2', name: 'Banano', category: 'Frutas', brand: 'Local', unit: 'kg', emoji: '🍌' },
  { id: '3', name: 'Naranja', category: 'Frutas', brand: 'Importada', unit: 'kg', emoji: '🍊' },
  { id: '4', name: 'Leche Colanta 1L', category: 'Lácteos', brand: 'Colanta', unit: 'unidad', emoji: '🥛' },
  { id: '5', name: 'Queso Campesino', category: 'Lácteos', brand: 'Local', unit: 'gr', emoji: '🧀' },
  { id: '6', name: 'Mantequilla', category: 'Lácteos', brand: 'Rama', unit: 'und', emoji: '🧈' },
];

export default function ProductsPage() {
  // 1. Estados de Datos y Filtros
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // 2. Estados de UI (Modales, Menús, Toasts)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // 3. Lógica de Filtrado y Agrupación (Procesamiento)
  const groupedProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    return filtered.reduce((groups, p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
      return groups;
    }, {} as Record<string, Product[]>);
  }, [search, selectedCategory, products]);

  const totalProducts = Object.values(groupedProducts).flat().length;

  // 4. Acciones
  const handleDelete = () => {
    if (!deleteModal.product) return;
    setProducts(prev => prev.filter(p => p.id !== deleteModal.product?.id));
    setToast({ show: true, message: `"${deleteModal.product.name}" eliminado`, type: 'success' });
    setDeleteModal({ open: false, product: null });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>

      {/* Barra de Herramientas (Funcional) */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${search ? 'text-primary-600' : 'text-gray-400'}`} size={20} />
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl font-semibold transition-all ${isFilterOpen ? 'border-primary-600 text-primary-600' : 'border-gray-200 text-gray-700'}`}
          >
            {selectedCategory} <Filter size={16} />
          </button>

          {/* Dropdown de Filtro */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute top-full mt-2 left-0 lg:right-0 lg:left-auto w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-dropdownOpen">
                {['Todos', 'Frutas', 'Lácteos', 'Otros'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex justify-between items-center"
                  >
                    {cat} {selectedCategory === cat && <Check size={14} className="text-primary-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
          
          <Button variant="primary" className="flex-1 lg:flex-none gap-2">
            <Plus size={20} /> Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Contador */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-gray-500">{totalProducts} productos</p>
        <div className="h-px bg-gray-200 w-full" />
      </div>

      {/* Listado Agrupado */}
      {totalProducts > 0 ? (
        <div className="space-y-10">
          {Object.entries(groupedProducts).map(([category, items]) => (
            <section key={category} className="space-y-4">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                {category === 'Frutas' ? '🍎' : '🥛'} {category.toUpperCase()} ({items.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isMenuOpen={activeMenuId === product.id}
                    onMenuToggle={() => setActiveMenuId(activeMenuId === product.id ? null : product.id)}
                    onDelete={() => {
                      setDeleteModal({ open: true, product });
                      setActiveMenuId(null);
                    }}
                  />
                ))}
              </div>
              <div className="h-px bg-gray-100 w-full pt-4" />
            </section>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<Package size={48} />}
          title="No se encontraron productos"
          description="Prueba cambiando los filtros o el término de búsqueda."
        />
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal 
        isOpen={deleteModal.open} 
        onClose={() => setDeleteModal({ open: false, product: null })}
        title="¿Eliminar producto?"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-error-50 text-error-main rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <p className="text-gray-600">
            ¿Confirmas que deseas eliminar <span className="font-bold text-gray-900">"{deleteModal.product?.name}"</span>?
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModal({ open: false, product: null })}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Eliminar</Button>
          </div>
        </div>
      </Modal>

      {/* TOAST FEEDBACK */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
}

// Componente de Tarjeta
function ProductCard({ product, isMenuOpen, onMenuToggle, onDelete }: any) {
  return (
    <Card className="p-4 relative group hover:border-primary-300 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="text-3xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-primary-50 transition-colors">
          {product.emoji}
        </div>
        <div className="relative">
          <button 
            onClick={onMenuToggle}
            className={`p-1.5 rounded-lg transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <MoreVertical size={20} />
          </button>
          
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={onMenuToggle} />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-dropdownOpen">
                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-700">
                  <Pencil size={14} /> Editar
                </button>
                <button 
                  onClick={onDelete}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-error-50 text-error-main font-medium"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 font-medium">{product.category} · {product.unit}</p>
      </div>
    </Card>
  );
}