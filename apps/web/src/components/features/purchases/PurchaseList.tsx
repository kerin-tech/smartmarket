// src/components/features/purchases/PurchaseList.tsx

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { PurchaseListSkeleton } from '@/components/ui/Skeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PurchaseCard } from './PurchaseCard';
import { PurchaseForm } from './PurchaseForm';

import { useToast } from '@/hooks/useToast';
import { usePurchaseStore, useTotalAmount, usePurchasesByMonth } from '@/stores/purchase.store';
import { purchaseService } from '@/services/purchase.service';
import { storeService } from '@/services/store.service';
import { formatCurrency } from '@/utils/formatters';
import type { CreatePurchaseRequest, Purchase } from '@/types/purchase.types';
import type { Store } from '@/types/store.types';

// Generar opciones de mes (últimos 12 meses)
const generateMonthOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  
  return options;
};

export function PurchaseList() {
  const {
    purchases,
    isLoading,
    filters,
    pagination,
    setPurchases,
    setLoading,
    setPagination,
    setPage,
    setFilters,
    isModalOpen,
    editingPurchase,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteModalOpen,
    deletingPurchase,
    openDeleteModal,
    closeDeleteModal,
    addPurchase,
    updatePurchase,
    removePurchase,
    resetFilters,
  } = usePurchaseStore();

  const totalAmount = useTotalAmount();
  const purchasesByMonth = usePurchasesByMonth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const monthOptions = generateMonthOptions();

  // Cargar compras
  useEffect(() => {
    let isMounted = true;
    
    const loadPurchases = async () => {
      setLoading(true);
      try {
        const response = await purchaseService.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        });
        if (isMounted) {
          setPurchases(response.purchases);
          setPagination(response.pagination);
        }
      } catch (err: any) {
        if (isMounted) {
          showError(err.message || 'Error al cargar las compras');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPurchases();
    
    return () => {
      isMounted = false;
    };
  }, [filters.month, filters.storeId, filters.search, pagination.page, pagination.limit]);

  // Cargar tiendas para filtro
  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await storeService.getAll({ limit: 100 });
        setStores(response.stores);
      } catch (err) {
        console.error('Error loading stores:', err);
      }
    };
    loadStores();
  }, []);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (filters.search || '')) {
        setFilters({ search: searchQuery || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Crear o editar compra
  const handleSubmit = async (data: CreatePurchaseRequest) => {
    setIsSubmitting(true);
    try {
      if (editingPurchase) {
        const updated = await purchaseService.update(editingPurchase.id, data);
        updatePurchase(updated);
        success('Compra actualizada correctamente');
      } else {
        const created = await purchaseService.create(data);
        addPurchase(created);
        success('Compra registrada correctamente');
      }
      closeModal();
    } catch (err: any) {
      showError(err.message || 'Error al guardar la compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar compra
  const handleDelete = async () => {
    if (!deletingPurchase) return;

    setIsDeleting(true);
    try {
      await purchaseService.delete(deletingPurchase.id);
      removePurchase(deletingPurchase.id);
      success('Compra eliminada correctamente');
      closeDeleteModal();
    } catch (err: any) {
      showError(err.message || 'Error al eliminar la compra');
    } finally {
      setIsDeleting(false);
    }
  };

  // Opciones para filtro de tiendas
  const storeFilterOptions = [
    { value: 'all', label: 'Todos los locales' },
    ...stores.map(s => ({ value: s.id, label: s.name })),
  ];

  // Opciones para filtro de mes
  const monthFilterOptions = [
    { value: 'all', label: 'Todos los meses' },
    ...monthOptions,
  ];

  // Renderizar contenido
  const renderContent = () => {
    if (isLoading) {
      return <PurchaseListSkeleton count={6} />;
    }

    // Empty state: sin compras
    if (pagination.total === 0 && !filters.month && !filters.storeId && !filters.search) {
      return (
        <EmptyState
          type="purchases"
          title="No tienes compras registradas"
          description="Registra tu primera compra para comenzar a comparar precios y hacer seguimiento de tus gastos."
          actionLabel="Registrar primera compra"
          onAction={openCreateModal}
        />
      );
    }

    // Empty state: sin resultados de búsqueda/filtro
    if (purchases.length === 0) {
      return (
        <EmptyState
          type="purchases"
          title="Sin resultados"
          description={
            filters.search 
              ? `No encontramos compras que coincidan con "${filters.search}"` 
              : 'No hay compras con los filtros seleccionados'
          }
          actionLabel="Limpiar filtros"
          onAction={resetFilters}
        />
      );
    }

    // Mostrar compras agrupadas por mes
    return (
      <div className="space-y-6">
        {purchasesByMonth.map((group) => (
          <section key={group.monthKey}>
            {/* Month header */}
            <h2 className="flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              <span>{group.monthLabel}</span>
              <span className="text-muted-foreground">{formatCurrency(group.total)}</span>
            </h2>

            {/* Purchases list */}
            <div className="bg-card rounded-xl border border-color overflow-hidden divide-y divide-border">
              {group.purchases.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  searchQuery={filters.search}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Compras</h1>
          {!isLoading && pagination.total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total: <span className="font-semibold text-primary-600">{formatCurrency(totalAmount)}</span>
            </p>
          )}
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-5 w-5" />}>
          Nueva compra
        </Button>
      </div>

      {/* Search and Filters */}
      {!isLoading && (pagination.total > 0 || filters.month || filters.storeId || filters.search) && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
          <FilterSelect
            options={storeFilterOptions}
            value={filters.storeId || 'all'}
            onChange={(value) => setFilters({ storeId: value === 'all' ? undefined : value })}
          />
          <FilterSelect
            options={monthFilterOptions}
            value={filters.month || 'all'}
            onChange={(value) => setFilters({ month: value === 'all' ? undefined : value })}
          />
        </div>
      )}

      {/* Results count */}
      {!isLoading && pagination.total > 0 && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {pagination.total} {pagination.total === 1 ? 'compra' : 'compras'}
          {filters.search && ` para "${filters.search}"`}
        </p>
      )}

      {/* Content */}
      {renderContent()}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setPage(pagination.page - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setPage(pagination.page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Purchase Form Modal */}
      <PurchaseForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        purchase={editingPurchase}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar compra"
        message={`¿Estás seguro de eliminar esta compra en "${deletingPurchase?.store.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}