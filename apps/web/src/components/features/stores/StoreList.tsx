// src/components/features/stores/StoreList.tsx

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { StoreListSkeleton } from '@/components/ui/Skeleton';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { StoreCard } from './StoreCard';
import { StoreForm } from './StoreForm';

import { useToast } from '@/hooks/useToast';
import { useStoreStore, useFilteredStores } from '@/stores/store.store';
import { storeService } from '@/services/store.service';
import type { StoreFormValues } from '@/lib/validations/store.schema';

export function StoreList() {
  const {
    stores,
    isLoading,
    setStores,
    setLoading,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    editingStore,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteModalOpen,
    deletingStore,
    openDeleteModal,
    closeDeleteModal,
    addStore,
    updateStore,
    removeStore,
  } = useStoreStore();

  const filteredStores = useFilteredStores();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar tiendas al montar
  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      try {
        const response = await storeService.getAll({ limit: 100 });
        setStores(response.stores);
      } catch (err: any) {
        showError(err.message || 'Error al cargar los locales');
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  // Crear o editar tienda
  const handleSubmit = async (data: StoreFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingStore) {
        const updated = await storeService.update(editingStore.id, data);
        updateStore(updated);
        success('Local actualizado correctamente');
      } else {
        const created = await storeService.create(data);
        addStore(created);
        success('Local creado correctamente');
      }
      closeModal();
    } catch (err: any) {
      showError(err.message || 'Error al guardar el local');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar tienda
  const handleDelete = async () => {
    if (!deletingStore) return;

    setIsDeleting(true);
    try {
      await storeService.delete(deletingStore.id);
      removeStore(deletingStore.id);
      success('Local eliminado correctamente');
      closeDeleteModal();
    } catch (err: any) {
      showError(err.message || 'Error al eliminar el local');
    } finally {
      setIsDeleting(false);
    }
  };

  // Renderizar contenido
  const renderContent = () => {
    if (isLoading) {
      return <StoreListSkeleton count={6} />;
    }

    // Empty state: sin tiendas
    if (stores.length === 0) {
      return (
        <EmptyState
          type="stores"
          title="No tienes locales"
          description="Agrega los locales donde compras frecuentemente para poder registrar tus compras y comparar precios."
          actionLabel="Agregar primer local"
          onAction={openCreateModal}
        />
      );
    }

    // Empty state: sin resultados de búsqueda
    if (filteredStores.length === 0) {
      return (
        <EmptyState
          type="stores"
          title="Sin resultados"
          description={`No encontramos locales que coincidan con "${searchQuery}"`}
          actionLabel={`Agregar "${searchQuery}"`}
          onAction={openCreateModal}
        />
      );
    }

    // Mostrar lista de tiendas
    return (
      <div className="bg-card rounded-xl border border-color overflow-hidden divide-y divide-border">
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Locales</h1>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-5 w-5" />}>
          Nuevo local
        </Button>
      </div>

      {/* Search */}
      {!isLoading && stores.length > 0 && (
        <div className="max-w-md">
          <SearchInput
            placeholder="Buscar local..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>
      )}

      {/* Results count */}
      {!isLoading && stores.length > 0 && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filteredStores.length} {filteredStores.length === 1 ? 'local' : 'locales'}
          {searchQuery && ` para "${searchQuery}"`}
        </p>
      )}

      {/* Content */}
      {renderContent()}

      {/* Store Form Modal */}
      <StoreForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        store={editingStore}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar local"
        message={`¿Estás seguro de eliminar "${deletingStore?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}