// src/components/features/products/ProductList.tsx

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

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
import { getCategoryConfig } from '@/types/product.types';

const categoryOrder = [
  'Frutas', 'Verduras', 'Granos', 'Lácteos', 'Carnes', 'Bebidas', 'Limpieza', 'Otros'
];

export function ProductList() {
  const {
    isLoading,
    setProducts,
    setLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isModalOpen,
    editingProduct,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteModalOpen,
    deletingProduct,
    openDeleteModal,
    closeDeleteModal,
    addProduct,
    updateProduct,
    removeProduct,
  } = useProductStore();

  const filteredProducts = useFilteredProducts();
  const categoryCounts = useCategoryCounts();
  const groupedProducts = useGroupedProducts();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    { value: 'all', label: 'Todos', count: categoryCounts.all },
    ...categoryOrder
      .filter(cat => categoryCounts[cat] > 0)
      .map(cat => {
        const config = getCategoryConfig(cat);
        return {
          value: cat,
          label: config.label,
          emoji: config.emoji,
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
    } finally {
      setIsSubmitting(false);
    }
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
    } finally {
      setIsDeleting(false);
    }
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
      <div className="space-y-6">
        {categoryOrder.map((categoryKey) => {
          const products = groupedProducts.get(categoryKey);
          if (!products || products.length === 0) return null;
          const config = getCategoryConfig(categoryKey);

          return (
            <section key={categoryKey} className="animate-in fade-in duration-500">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                <span className="opacity-50">({products.length})</span>
              </h2>
              <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border shadow-sm">
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
    <div className="space-y-6 pb-28"> {/* Espacio inferior para el Nav + FAB */}
      
      {/* HEADER DINÁMICO */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Mis Productos</h1>
        {/* Visible solo en Desktop */}
        <Button 
          onClick={openCreateModal} 
          leftIcon={<Plus className="h-5 w-5" />}
          className="hidden sm:flex"
        >
          Nuevo producto
        </Button>
      </div>

      {/* FILTROS */}
      {!isLoading && categoryCounts.all > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <FilterSelect
            options={filterOptions}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
          />
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {renderContent()}

      {/* BOTÓN FLOTANTE (FAB) CIRCULAR CON ETIQUETA - Solo Mobile */}
      <div className="fixed bottom-28 right-6 z-40 flex items-center gap-3 sm:hidden">
        
        {/* Etiqueta flotante (La píldora) */}
        <span className="bg-card border border-border text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
          Nuevo Producto
        </span>

        {/* Botón Circular */}
        <button
          onClick={openCreateModal}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform active:scale-90 hover:scale-105"
          style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }}
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* MODALES */}
      <ProductForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        product={editingProduct}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deletingProduct?.name}"?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}