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
import { categoryConfig, type CategoryKey } from '@/types/product.types';

// Orden de categorías para mostrar
const categoryOrder: CategoryKey[] = [
  'fruits', 'vegetables', 'grains', 'dairy', 'meats', 'beverages', 'cleaning', 'other'
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
    closeMenu,
  } = useProductStore();

  const filteredProducts = useFilteredProducts();
  const categoryCounts = useCategoryCounts();
  const groupedProducts = useGroupedProducts();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAll();
        setProducts(response.products);
      } catch (err) {
        showError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Opciones para el filtro
  const filterOptions = [
    { value: 'all', label: 'Todos', count: categoryCounts.all },
    ...categoryOrder
      .filter(cat => categoryCounts[cat] > 0)
      .map(cat => ({
        value: cat,
        label: categoryConfig[cat].label,
        emoji: categoryConfig[cat].emoji,
        count: categoryCounts[cat] || 0,
      })),
  ];

  // Crear o editar producto
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

  // Eliminar producto
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

  // Renderizar contenido
  const renderContent = () => {
    if (isLoading) {
      return <ProductListSkeleton count={6} />;
    }

    // Empty state: sin productos
    if (categoryCounts.all === 0) {
      return (
        <EmptyState
          type="products"
          title="No tienes productos"
          description="Comienza agregando los productos que compras frecuentemente para poder comparar precios."
          actionLabel="Agregar primer producto"
          onAction={openCreateModal}
        />
      );
    }

    // Empty state: sin resultados de búsqueda/filtro
    if (filteredProducts.length === 0) {
      return (
        <EmptyState
          type="products"
          title="Sin resultados"
          description={
            searchQuery 
              ? `No encontramos productos que coincidan con "${searchQuery}"` 
              : 'No hay productos en esta categoría'
          }
          actionLabel={searchQuery ? `Agregar "${searchQuery}"` : 'Limpiar filtro'}
          onAction={() => {
            if (searchQuery) {
              openCreateModal();
            } else {
              setSelectedCategory('all');
            }
          }}
        />
      );
    }

    // Mostrar productos agrupados por categoría
    return (
      <div className="space-y-6">
        {categoryOrder.map((categoryKey) => {
          const products = groupedProducts.get(categoryKey);
          if (!products || products.length === 0) return null;

          const config = categoryConfig[categoryKey];

          return (
            <section key={categoryKey} aria-labelledby={`category-${categoryKey}`}>
              {/* Category header */}
              <h2 
                id={`category-${categoryKey}`}
                className="flex items-center gap-2 text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-2 px-1"
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                <span className="text-secondary-400">({products.length})</span>
              </h2>

              {/* Products list */}
              <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden divide-y divide-secondary-100">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Mis Productos</h1>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-5 w-5" />}>
          Nuevo producto
        </Button>
      </div>

      {/* Search and Filter */}
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
            onChange={(value) => setSelectedCategory(value as CategoryKey | 'all')}
          />
        </div>
      )}

      {/* Results count */}
      {!isLoading && categoryCounts.all > 0 && (
        <p className="text-sm text-secondary-500" aria-live="polite">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
          {selectedCategory !== 'all' && ` en ${categoryConfig[selectedCategory as CategoryKey]?.label}`}
          {searchQuery && ` para "${searchQuery}"`}
        </p>
      )}

      {/* Content */}
      {renderContent()}

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        product={editingProduct}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}