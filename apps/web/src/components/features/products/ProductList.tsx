'use client';

import { useEffect, useState } from 'react';
import { Plus, RotateCcw, X, Tag } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductListSkeleton } from '@/components/ui/Skeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';

import { useToast } from '@/hooks/useToast';
import { 
  useProductStore, 
  useFilteredProducts, 
  useCategoryCounts,
  useGroupedProducts 
} from '@/stores/product.store';
import { productService } from '@/services/product.service';
import type { ProductFormValues } from '@/lib/validations/product.schema';
import { categoryConfig, getCategoryConfig } from '@/types/product.types';

export function ProductList() {
  const {
    isLoading, setProducts, setLoading, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory, isModalOpen, editingProduct,
    openCreateModal, openEditModal, closeModal, isDeleteModalOpen,
    deletingProduct, openDeleteModal, closeDeleteModal, addProduct,
    updateProduct, removeProduct,
  } = useProductStore();

  const filteredProducts = useFilteredProducts();
  const categoryCounts = useCategoryCounts();
  const groupedProducts = useGroupedProducts();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentCategories = Object.keys(categoryConfig);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAll({ limit: 100 });
        setProducts(response.products);
      } catch (err: any) {
        showError(err.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [setLoading, setProducts, showError]);

  const filterOptions = [
    { value: 'all', label: 'Todas las categorías', count: categoryCounts.all },
    ...currentCategories
      .filter(cat => categoryCounts[cat] > 0)
      .map(cat => {
        const config = getCategoryConfig(cat);
        return {
          value: cat,
          label: config.label,
          count: categoryCounts[cat] || 0,
        };
      }),
  ];

  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const updated = await productService.update(editingProduct.id, data);
        updateProduct(updated);
        success('Producto actualizado correctamente');
      } else {
        const created = await productService.create(data);
        addProduct(created);
        success('Producto creado correctamente');
      }
      closeModal();
    } catch (err: any) {
      showError(err.message || 'Error al guardar el producto');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await productService.delete(deletingProduct.id);
      removeProduct(deletingProduct.id);
      success('Producto eliminado correctamente');
      closeDeleteModal();
    } catch (err: any) {
      showError(err.message || 'Error al eliminar el producto');
    } finally { setIsDeleting(false); }
  };

  const renderContent = () => {
    if (isLoading) return <ProductListSkeleton count={6} />;

    if (categoryCounts.all === 0) {
      return (
        <EmptyState
          type="products"
          title="No tienes productos"
          description="Comienza agregando los productos que compras frecuentemente."
          actionLabel="Agregar primer producto"
          onAction={openCreateModal}
        />
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <EmptyState
          type="products"
          title="Sin resultados"
          description={searchQuery ? `No coinciden con "${searchQuery}"` : 'No hay productos aquí'}
          actionLabel={searchQuery ? `Agregar "${searchQuery}"` : 'Limpiar filtro'}
          onAction={() => searchQuery ? openCreateModal() : setSelectedCategory('all')}
        />
      );
    }

    return (
      <div className="space-y-8">
        {currentCategories.map((categoryKey) => {
          const products = groupedProducts.get(categoryKey);
          if (!products || products.length === 0) return null;
          const config = getCategoryConfig(categoryKey);

          return (
            <section key={categoryKey} className="animate-in fade-in duration-500">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
                <span>{config.label}</span>
                <span className="opacity-50">({products.length})</span>
              </h2>
              <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mis Productos</h1>
        <Button 
          onClick={openCreateModal} 
          leftIcon={<Plus className="h-5 w-5" />}
          className="hidden sm:flex shadow-lg shadow-primary/20"
        >
          Nuevo producto
        </Button>
      </div>

      {/* Barra de Filtros Unificada (Siguiendo tu diseño manual de PurchaseList) */}
      {!isLoading && categoryCounts.all > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            
            {/* Búsqueda */}
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                className="sm:border-0 sm:shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Divisor Vertical */}
            <div className="hidden sm:block w-px h-8 bg-border mx-2" />

            {/* Categoría */}
            <div>
              <FilterSelect
                options={filterOptions}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                className="sm:border-0 sm:shadow-none"
              />
            </div>
          </div>

          {/* Badges de Filtros Activos (Basado en tu diseño manual) */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 px-1 animate-in fade-in duration-300">
              <span className="text-sm font-bold text-muted-foreground tracking-wider mr-1">Filtros:</span>
              
              {searchQuery && (
                <BadgeFilter label={`"${searchQuery}"`} onRemove={() => setSearchQuery('')} />
              )}

              {selectedCategory !== 'all' && (
                <BadgeFilter 
                  label={getCategoryConfig(selectedCategory).label} 
                  icon={<Tag className="h-3 w-3" />}
                  onRemove={() => setSelectedCategory('all')} 
                />
              )}

              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors ml-2 flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" /> Resetear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative min-h-[400px]">
        {renderContent()}
      </div>

      {/* FAB Mobile */}
      <div className="fixed bottom-24 right-6 z-40 sm:hidden">
        <button
          onClick={openCreateModal}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl active:scale-95 transition-all"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      <ProductForm isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} product={editingProduct} isLoading={isSubmitting} />

      <ConfirmModal
        isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDelete}
        title="Eliminar producto" message={`¿Estás seguro de eliminar "${deletingProduct?.name}"?`}
        confirmText="Sí, eliminar" isLoading={isDeleting} variant="danger"
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// Componente BadgeFilter (con los colores que definiste manual)
function BadgeFilter({ label, onRemove, icon }: { label: string, onRemove: () => void, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-primary-700 border border-primary/10 rounded-2xl text-primary text-sm font-semibold">
      {icon}
      <span className="max-w-[120px] truncate">{label}</span>
      <button onClick={onRemove} className="hover:bg-primary-600 rounded-md p-0.5 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}