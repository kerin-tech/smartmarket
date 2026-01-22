// src/components/features/stores/StoreForm.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { storeSchema, type StoreFormValues } from '@/lib/validations/store.schema';
import { storeSuggestions } from '@/types/store.types';
import type { Store } from '@/types/store.types';

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreFormValues) => Promise<void>;
  store?: Store | null;
  isLoading?: boolean;
}

export function StoreForm({
  isOpen,
  onClose,
  onSubmit,
  store,
  isLoading = false,
}: StoreFormProps) {
  const isEditing = !!store;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      location: '',
    },
  });

  const nameValue = watch('name');

  // Cargar datos cuando se edita
  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        location: store.location || '',
      });
    } else {
      reset({
        name: '',
        location: '',
      });
    }
  }, [store, reset, isOpen]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: StoreFormValues) => {
    await onSubmit(data);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue('name', suggestion, { shouldValidate: true });
  };

  // Filtrar sugerencias que coincidan con lo escrito
  const filteredSuggestions = storeSuggestions.filter(
    (s) => 
      !nameValue || 
      s.name.toLowerCase().includes(nameValue.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Local' : 'Nuevo Local'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Nombre */}
        <div>
          <Input
            label="Nombre del local"
            placeholder="Ej: Éxito Poblado"
            autoFocus
            disabled={isLoading}
            error={errors.name?.message}
            {...register('name')}
          />
          
          {/* Sugerencias */}
          {!isEditing && filteredSuggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-secondary-500 mb-2">Sugerencias:</p>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.name)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors disabled:opacity-50"
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <Input
          label="Ubicación (opcional)"
          placeholder="Ej: Calle 10 #43-12, Medellín"
          disabled={isLoading}
          error={errors.location?.message}
          helperText={!errors.location ? 'Dirección o referencia del local.' : undefined}
          {...register('location')}
        />

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!isValid}
          >
            {isEditing ? 'Guardar cambios' : 'Guardar local'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}