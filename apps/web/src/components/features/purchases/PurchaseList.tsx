// src/components/features/purchases/PurchaseList.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PurchaseListSkeleton } from '@/components/ui/Skeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PurchaseCard } from './PurchaseCard';
import { PurchaseForm } from './PurchaseForm';
import { PurchaseFilters } from './PurchaseFilters';

import { useToast } from '@/hooks/useToast';
import { usePurchaseStore, useTotalAmount, usePurchasesByMonth } from '@/stores/purchase.store';
import { purchaseService } from '@/services/purchase.service';
import { formatCurrency } from '@/utils/formatters';
import type { CreatePurchaseRequest, Purchase } from '@/types/purchase.types';

export function PurchaseList() {
  const router = useRouter();
  const {
    purchases,
    isLoading,
    filters,
    pagination,
    setPurchases,
    setLoading,
    setPagination,
    setPage,
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

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setPurchases(response.purchases);
      setPagination(response.pagination);
    } catch (err: any) {
      showError(err.message || 'Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

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

  const handlePurchaseClick = (purchase: Purchase) => {
    openEditModal(purchase);
  };

  const renderContent = () => {
    if (isLoading) {
      return <PurchaseListSkeleton count={6} />;
    }

    if (purchases.length === 0 && !filters.month && !filters.storeId && !filters.search) {
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

    if (purchases.length === 0) {
      return (
        <EmptyState
          type="purchases"
          title="Sin resultados"
          description="No encontramos compras con los filtros seleccionados."
          actionLabel="Limpiar filtros"
          onAction={resetFilters}
        />
      );
    }

    return (
      <div className="space-y-6">
        {purchasesByMonth.map((group) => (
          <div key={group.monthKey}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
                {group.monthLabel}
              </h2>
              <span className="text-sm text-secondary-500">
                {formatCurrency(group.total)}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
              {group.purchases.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onClick={handlePurchaseClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Mis Compras</h1>
          {!isLoading && purchases.length > 0 && (
            <p className="text-sm text-secondary-500 mt-1">
              Total: <span className="font-semibold text-primary-600">{formatCurrency(totalAmount)}</span>
              {' · '}{pagination.total} {pagination.total === 1 ? 'compra' : 'compras'}
            </p>
          )}
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-5 w-5" />}>
          Nueva compra
        </Button>
      </div>

      <PurchaseFilters />

      {renderContent()}

      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(pagination.page - 1)}>
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-secondary-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(pagination.page + 1)}>
            Siguiente
          </Button>
        </div>
      )}

      <PurchaseForm isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} purchase={editingPurchase} isLoading={isSubmitting} />

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

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}