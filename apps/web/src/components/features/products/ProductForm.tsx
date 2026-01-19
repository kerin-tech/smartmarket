// src/components/features/products/ProductForm.tsx

'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { 
  productSchema, 
  categoryOptions, 
  unitOptions,
  type ProductFormValues 
} from '@/lib/validations/product.schema';
import type { Product } from '@/types/product.types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}: ProductFormProps) {
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: undefined,
      unit: undefined,
    },
  });

  // Cargar datos cuando se edita
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        unit: product.unit,
      });
    } else {
      reset({
        name: '',
        category: undefined,
        unit: undefined,
      });
    }
  }, [product, reset, isOpen]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: ProductFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Nombre */}
        <Input
          label="Nombre del producto"
          placeholder="Ej: Arroz Diana 1kg"
          autoFocus
          disabled={isLoading}
          error={errors.name?.message}
          helperText={!errors.name ? 'Usa un nombre descriptivo que te ayude a identificar el producto.' : undefined}
          {...register('name')}
        />

        {/* Categoría */}
        <Select
          label="Categoría"
          placeholder="Selecciona categoría"
          options={categoryOptions.map((c) => ({
            value: c.value,
            label: c.label,
            emoji: c.emoji,
          }))}
          disabled={isLoading}
          error={errors.category?.message}
          {...register('category')}
        />

        {/* Unidad de medida */}
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <ChipGroup
              label="Unidad de medida"
              options={unitOptions}
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
              error={errors.unit?.message}
            />
          )}
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
            {isEditing ? 'Guardar cambios' : 'Guardar producto'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
