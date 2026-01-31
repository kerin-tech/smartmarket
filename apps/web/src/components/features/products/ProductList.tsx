'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, RotateCcw, X, Tag } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductListSkeleton } from '@/components/ui/Skeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationPrevious, 
  PaginationNext 
} from '@/components/ui/Pagination';

import { ProductCard } from './ProductCard';
import { ProductTable } from './ProductTable';
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

  // --- Lógica de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const currentCategories = Object.keys(categoryConfig);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAllWithoutPagination();
        setProducts(response.products);
      } catch (err: any) {
        showError(err.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [setLoading, setProducts, showError]);

  // Resetear página cuando cambian los filtros para evitar quedar en una página vacía
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filterOptions = [
    { value: 'all', label: 'Todas las categorías', count: categoryCounts.all },
    ...currentCategories
      .filter(cat => categoryCounts[cat] > 0)
      .map(cat => ({
        value: cat,
        label: getCategoryConfig(cat).label,
        count: categoryCounts[cat] || 0,
      })),
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
        {/* VISTA DESKTOP: Tabla con Paginación Estilo Shadcn UI */}
        <div className="hidden md:block space-y-4">
          <ProductTable 
            products={paginatedProducts} 
            onEdit={openEditModal} 
            onDelete={openDeleteModal}
            searchQuery={searchQuery}
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4 border-t border-border mt-4">
              <p className="text-sm text-muted-foreground">
                Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span>
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* VISTA MOBILE: Secciones por Categoría (Manteniendo tu diseño original) */}
        <div className="md:hidden space-y-8">
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
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      <PageHeader
        title="Mis Productos"
        actions={
          <Button
            onClick={openCreateModal}
            leftIcon={<Plus className="h-5 w-5" />}
            className="hidden sm:flex shadow-lg shadow-primary/20"
          >
            Nuevo producto
          </Button>
        }
      />

      {/* Barra de Filtros y Búsqueda */}
      {!isLoading && categoryCounts.all > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 bg-card p-2 rounded-xl border border-border shadow-sm">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por nombre o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
              />
            </div>
            <div className="hidden sm:block w-px h-8 bg-border mx-2" />
            <div className="min-w-[200px]">
              <FilterSelect
                options={filterOptions}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                className="border-0 shadow-none bg-transparent"
              />
            </div>
          </div>

          {/* Badges de Filtros Activos */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 px-1 animate-in slide-in-from-top-1 duration-300">
              <span className="text-sm font-bold text-muted-foreground tracking-wider mr-1">FILTROS:</span>
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
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors ml-2 flex items-center gap-1 uppercase"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpiar Todo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid / Tabla de Contenido */}
      <div className="relative min-h-[400px]">
        {renderContent()}
      </div>

      {/* Botón Flotante (FAB) para Móvil */}
      <div className="fixed bottom-28 right-6 z-40 flex items-center gap-3 sm:hidden">
        <span className="bg-card border border-border text-foreground text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl shadow-xl">
          Nuevo
        </span>
        <button
          onClick={openCreateModal}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl active:scale-90 transition-transform"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Modales de Gestión */}
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
        message={`Esta acción no se puede deshacer. ¿Estás seguro de eliminar "${deletingProduct?.name}"?`}
        confirmText="Sí, eliminar" 
        isLoading={isDeleting} 
        variant="danger"
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

/**
 * Componente interno para mostrar los filtros aplicados de forma elegante
 */
function BadgeFilter({ label, onRemove, icon }: { label: string, onRemove: () => void, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-bold transition-all hover:bg-primary/15">
      {icon}
      <span className="max-w-[150px] truncate uppercase tracking-tight">{label}</span>
      <button 
        onClick={onRemove} 
        className="hover:bg-primary/20 rounded-md p-0.5 transition-colors"
        aria-label="Eliminar filtro"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}