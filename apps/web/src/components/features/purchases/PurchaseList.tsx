'use client';

import { useEffect, useState } from 'react';
import { Plus, RotateCcw, X, Store as StoreIcon, Calendar } from 'lucide-react';

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
import type { CreatePurchaseRequest } from '@/types/purchase.types';
import type { Store } from '@/types/store.types';

const MONTHS = [
  { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));
};

export function PurchaseList() {
  const {
    purchases, isLoading, filters, pagination, setPurchases, setLoading,
    setPagination, setPage, setFilters, isModalOpen, editingPurchase,
    openCreateModal, openEditModal, closeModal, isDeleteModalOpen,
    deletingPurchase, openDeleteModal, closeDeleteModal, addPurchase,
    updatePurchase, removePurchase, resetFilters,
  } = usePurchaseStore();

  const totalAmount = useTotalAmount();
  const purchasesByMonth = usePurchasesByMonth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

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
        if (isMounted) showError(err.message || 'Error al cargar las compras');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPurchases();
    return () => { isMounted = false; };
  }, [filters, pagination.page]);

  useEffect(() => {
    storeService.getAll({ limit: 100 }).then(res => setStores(res.stores)).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchQuery || undefined });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMonthChange = (val: string) => {
    const currentYear = filters.month?.split('-')[0] || new Date().getFullYear().toString();
    setFilters({ month: val === 'all' ? undefined : `${currentYear}-${val}` });
  };

  const handleYearChange = (val: string) => {
    const currentMonth = filters.month?.split('-')[1] || String(new Date().getMonth() + 1).padStart(2, '0');
    setFilters({ month: `${val}-${currentMonth}` });
  };

  const getMonthName = (monthNum: string) => MONTHS.find(m => m.value === monthNum)?.label;
  const getStoreName = (id: string) => stores.find(s => s.id === id)?.name;

  const handleSubmit = async (data: CreatePurchaseRequest) => {
    setIsSubmitting(true);
    try {
      if (editingPurchase) {
        const updated = await purchaseService.update(editingPurchase.id, data);
        updatePurchase(updated);
        success('Compra actualizada');
      } else {
        const created = await purchaseService.create(data);
        addPurchase(created);
        success('Compra registrada');
      }
      closeModal();
    } catch (err: any) {
      showError(err.message || 'Error al guardar');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingPurchase) return;
    setIsDeleting(true);
    try {
      await purchaseService.delete(deletingPurchase.id);
      removePurchase(deletingPurchase.id);
      success('Compra eliminada');
      closeDeleteModal();
    } catch (err: any) {
      showError(err.message || 'Error al eliminar');
    } finally { setIsDeleting(false); }
  };

  const renderContent = () => {
    if (isLoading) return <PurchaseListSkeleton count={6} />;
    if (purchases.length === 0) {
      return (
        <EmptyState
          type="purchases"
          title={pagination.total === 0 && !filters.search ? "No tienes compras" : "Sin resultados"}
          description="Ajusta los filtros o registra una nueva compra."
          actionLabel={pagination.total === 0 ? "Registrar compra" : "Limpiar filtros"}
          onAction={pagination.total === 0 ? openCreateModal : resetFilters}
        />
      );
    }

    return (
      <div className="space-y-8">
        {purchasesByMonth.map((group) => (
          <section key={group.monthKey}>
            <h2 className="flex items-center justify-between text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
              <span>{group.monthLabel}</span>
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">{formatCurrency(group.total)}</span>
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm">
              {group.purchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} onEdit={openEditModal} onDelete={openDeleteModal} searchQuery={filters.search} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mis Compras</h1>
          {!isLoading && pagination.total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Inversión total: <span className="font-bold text-primary-600">{formatCurrency(totalAmount)}</span>
            </p>
          )}
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="h-5 w-5" />} className="hidden sm:flex shadow-lg shadow-primary/20">
          Nueva compra
        </Button>
      </div>

      {/* Barra de Búsqueda y Filtros Unificada (Sin BG) */}
      <div className="space-y-8" >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          
          {/* Búsqueda (100% en escritorio) */}
          <div className="flex-1 ">
            <SearchInput
              placeholder="Buscar por producto o tienda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => { setSearchQuery(''); setFilters({ search: undefined }); }}
              className="sm:border-0 sm:shadow-none focus-visible:ring-0"
            />
          </div>

        

          {/* Grid de Selectores */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className='flex-1'>
              <FilterSelect
                options={[{ value: 'all', label: 'Todas las tiendas' }, ...stores.map(s => ({ value: s.id, label: s.name }))]}
                value={filters.storeId || 'all'}
                onChange={(val) => setFilters({ storeId: val === 'all' ? undefined : val })}
                className="sm:border-0 sm:shadow-none"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-border mx-2" />

            <div className='flex gap-2'>
           <div className="flex-1 w-100 sm:flex-1">
              <FilterSelect
                options={[{ value: 'all', label: 'Cualquier mes' }, ...MONTHS]}
                value={filters.month?.split('-')[1] || 'all'}
                onChange={handleMonthChange}
                className="sm:border-0 sm:shadow-none"
              />
            </div>

            <div className=" flex-1">
              <FilterSelect
                options={generateYearOptions()}
                value={filters.month?.split('-')[0] || new Date().getFullYear().toString()}
                onChange={handleYearChange}
                className="sm:border-0 sm:shadow-none"
              />
            </div>
            </div>

           
          </div>
        </div>

        {/* Badges de Filtros Activos */}
        {(filters.search || filters.storeId || filters.month) && (
          <div className="flex flex-wrap items-center gap-2 px-1 animate-in fade-in duration-300">
            <span className="text-sm font-bold text-muted-foreground tracking-wider mr-1">Filtros:</span>
            
            {filters.search && (
              <BadgeFilter label={`"${filters.search}"`} onRemove={() => {setSearchQuery(''); setFilters({ search: undefined });}} />
            )}

            {filters.storeId && (
              <BadgeFilter 
                label={getStoreName(filters.storeId) || 'Tienda'} 
                icon={<StoreIcon className="h-3 w-3" />}
                onRemove={() => setFilters({ storeId: undefined })} 
              />
            )}

            {filters.month && (
              <BadgeFilter 
                label={`${getMonthName(filters.month.split('-')[1])} ${filters.month.split('-')[0]}`} 
                icon={<Calendar className="h-3 w-3" />}
                onRemove={() => setFilters({ month: undefined })} 
              />
            )}

            <button onClick={resetFilters} className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors ml-2 flex items-center gap-1">
              <RotateCcw className="h-4 w-4" /> Resetear
            </button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="relative min-h-[400px]">
        {renderContent()}
      </div>

      {/* Paginación */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(pagination.page - 1)}>
            Anterior
          </Button>
          <span className="text-sm font-medium">Página {pagination.page} de {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(pagination.page + 1)}>
            Siguiente
          </Button>
        </div>
      )}

      {/* FAB Mobile */}
      <div className="fixed bottom-24 right-6 z-40 sm:hidden">
        <button
          onClick={openCreateModal}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl active:scale-95 transition-all"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>

      <PurchaseForm isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} purchase={editingPurchase} isLoading={isSubmitting} />
      <ConfirmModal
        isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDelete}
        title="Eliminar compra" message="¿Estás seguro de eliminar este registro?"
        confirmText="Sí, eliminar" isLoading={isDeleting} variant="danger"
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

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