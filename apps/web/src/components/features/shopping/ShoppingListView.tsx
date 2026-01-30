'use client';

import { useEffect, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

import { ShoppingListCard } from './ShoppingListCard';
import { CreateListModal } from './CreateListModal';
import { OptimizedListView } from './OptimizedListView';
import { ShoppingListSkeleton } from './ShoppingListSkeleton';

import { useToast } from '@/hooks/useToast';
import { useShoppingListStore } from '@/stores/shoppingList.store';
import { shoppingListService } from '@/services/shoppingList.service';
import type { CreateShoppingListRequest } from '@/types/shoppingList.types';

export function ShoppingListView() {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    lists, activeList, isLoading, isLoadingActive,
    isCreateModalOpen, isDeleteModalOpen, deletingList,
    setLists, setActiveList, setLoading, setLoadingActive,
    addList, removeList, syncActiveToLists,
    openCreateModal, closeCreateModal,
    openDeleteModal, closeDeleteModal,
  } = useShoppingListStore();

  // Cargar listas al montar
  useEffect(() => {
    const loadLists = async () => {
      setLoading(true);
      try {
        const data = await shoppingListService.getAll();
        setLists(data);
      } catch (err: any) {
        showError(err.message || 'Error al cargar las listas');
      } finally {
        setLoading(false);
      }
    };
    loadLists();
  }, []);

  // Seleccionar una lista para ver optimizada
  const handleSelectList = async (listId: string) => {
    setLoadingActive(true);
    try {
      const optimized = await shoppingListService.getOptimized(listId);
      setActiveList(optimized);
    } catch (err: any) {
      showError(err.message || 'Error al cargar la lista');
    } finally {
      setLoadingActive(false);
    }
  };

  // Crear lista
  const handleCreate = async (data: CreateShoppingListRequest) => {
    setIsSubmitting(true);
    try {
      const newList = await shoppingListService.create(data);
      addList(newList);
      success('Lista creada');
      closeCreateModal();
      // Abrir la lista recién creada
      handleSelectList(newList.id);
    } catch (err: any) {
      showError(err.message || 'Error al crear la lista');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar lista
  const handleDelete = async () => {
    if (!deletingList) return;
    setIsDeleting(true);
    try {
      await shoppingListService.delete(deletingList.id);
      removeList(deletingList.id);
      success('Lista eliminada');
      closeDeleteModal();
    } catch (err: any) {
      showError(err.message || 'Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  // Duplicar lista
  const handleDuplicate = async (listId: string) => {
    try {
      const duplicated = await shoppingListService.duplicate(listId);
      addList(duplicated);
      success('Lista duplicada');
    } catch (err: any) {
      showError(err.message || 'Error al duplicar');
    }
  };

  // Volver a la lista de listas
  const handleBack = () => {
    syncActiveToLists();
    setActiveList(null);
  };

  // Si hay una lista activa, mostrar vista optimizada
  if (activeList) {
    return (
      <>
        <OptimizedListView
          list={activeList}
          onBack={handleBack}
          onReset={async () => {
            try {
              const reset = await shoppingListService.resetChecks(activeList.id);
              setActiveList(reset);
              success('Lista reiniciada');
            } catch (err: any) {
              showError(err.message || 'Error al reiniciar');
            }
          }}
        />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </>
    );
  }

  return (
    <div className="space-y-6 pb-32">


      
      {/* Header */}

      {/* Header - Botón atrás arriba del título en móvil */}
      <div className="space-y-3">
  {/* El botón de volver se queda arriba a la izquierda */}
  <Link href="/purchases" className="inline-flex">
    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft className="h-4 w-4" />
      <span>Volver a compras</span>
    </button>
  </Link>

  {/* Contenedor flex para alinear Títulos a la izquierda y Botón a la derecha */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Listas de Compras</h1>
      <p className="text-sm text-muted-foreground">
        Organiza tus compras por tienda y categoría
      </p>
    </div>

    <Button
      onClick={openCreateModal}
      leftIcon={<Plus className="h-5 w-5" />}
      className="hidden sm:flex" // En móvil ocupa todo el ancho, en desktop es automático
    >
      Nueva lista
    </Button>
  </div>
</div>
    

      {/* Content */}
      {isLoading ? (
        <ShoppingListSkeleton count={3} />
      ) : lists.length === 0 ? (
        <EmptyState
          type="purchases"
          title="No tienes listas"
          description="Crea tu primera lista de compras inteligente"
          actionLabel="Crear lista"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              onSelect={() => handleSelectList(list.id)}
              onDuplicate={() => handleDuplicate(list.id)}
              onDelete={() => openDeleteModal(list)}
            />
          ))}
        </div>
      )}

    
      {/* BOTÓN FLOTANTE (FAB) CON ETIQUETA - Mobile (bottom-28) */}
      <div className="fixed bottom-28 right-6 z-40 flex items-center gap-3 sm:hidden">
        <span className="bg-card border border-border text-foreground text-sm font-medium px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 tracking-tight">
          Nueva lista
        </span>
        <button
          onClick={openCreateModal}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform active:scale-90"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar lista"
        message={`¿Eliminar "${deletingList?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
        variant="danger"
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}