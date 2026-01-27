// src/components/features/stores/StoreList.tsx

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
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
  }, [setLoading, setStores, showError]);

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

  const renderContent = () => {
    if (isLoading) return <StoreListSkeleton count={6} />;

    if (stores.length === 0) {
      return (
        <EmptyState
          type="stores"
          title="No tienes locales"
          description="Agrega los locales donde compras frecuentemente para comparar precios."
          actionLabel="Agregar primer local"
          onAction={openCreateModal}
        />
      );
    }

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

    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border shadow-sm">
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
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Mis Locales</h1>
        {/* Visible solo en Web */}
        <Button 
          onClick={openCreateModal} 
          leftIcon={<Plus className="h-5 w-5" />}
          className="hidden sm:flex"
        >
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

      {/* BOTÓN FLOTANTE (FAB) CON ETIQUETA - Mobile (bottom-28) */}
      <div className="fixed bottom-28 right-6 z-40 flex items-center gap-3 sm:hidden">
        <span className="bg-card border border-border text-foreground text-sm font-medium px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 ">
          Nuevo local
        </span>
        <button
          onClick={openCreateModal}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform active:scale-90"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

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
        message={`¿Estás seguro de eliminar "${deletingStore?.name}"?`}
        confirmText="Eliminar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}