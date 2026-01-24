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
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    if (store && isOpen) {
      reset({
        name: store.name,
        location: store.location || '',
      });
    } else if (!store && isOpen) {
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
        <div>
          <Input
            label="Nombre del local"
            placeholder="Ej: Éxito Poblado"
            autoFocus
            disabled={isLoading}
            error={errors.name?.message}
            {...register('name')}
          />
          
          {/* Sugerencias con Iconos de Lucide corregidos */}
          {!isEditing && filteredSuggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Sugerencias comunes:</p>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.slice(0, 10).map((suggestion) => {
                  // CLAVE: Asignar el componente a una variable con Mayúscula
                  const Icon = suggestion.icon;
                  
                  return (
                    <button
                      key={suggestion.name}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.name)}
                      disabled={isLoading}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-border transition-all",
                        "bg-card hover:bg-muted hover:border-primary/30 text-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed group"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", suggestion.color)} />
                      <span>{suggestion.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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