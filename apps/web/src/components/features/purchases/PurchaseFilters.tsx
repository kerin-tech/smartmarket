// src/components/features/purchases/PurchaseFilters.tsx

'use client';

import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { usePurchaseStore } from '@/stores/purchase.store';
import { storeService } from '@/services/store.service';
import type { Store } from '@/types/store.types';

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

export function PurchaseFilters() {
  const { filters, setFilters, resetFilters } = usePurchaseStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      try {
        const response = await storeService.getAll({ limit: 100 });
        setStores(response.stores);
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        setFilters({ search: searchValue || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const storeOptions = [
    { value: '', label: 'Todos los locales' },
    ...stores.map((s) => ({ value: s.id, label: s.name })),
  ];

  const allMonthOptions = [
    { value: '', label: 'Todos los meses' },
    ...monthOptions,
  ];

  const hasActiveFilters = filters.month || filters.storeId || filters.search;

  if (loading) {
    return (
      <div className="flex gap-3">
        <div className="h-10 w-48 bg-secondary-200 rounded-lg animate-pulse" />
        <div className="h-10 w-40 bg-secondary-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar compra..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          placeholder="Local"
          options={storeOptions}
          value={filters.storeId || ''}
          onChange={(value) => setFilters({ storeId: value || undefined })}
          className="w-44"
        />

        <Select
          placeholder="Mes"
          options={allMonthOptions}
          value={filters.month || ''}
          onChange={(value) => setFilters({ month: value || undefined })}
          className="w-44"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} leftIcon={<X className="h-4 w-4" />}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}