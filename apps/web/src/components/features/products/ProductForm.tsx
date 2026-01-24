'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { productSchema, type ProductFormValues } from '@/lib/validations/product.schema';
import { categoryConfig } from '@/types/product.types';
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
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: '',
      brand: '',
    },
  });

  // Sincronizar datos al editar o abrir
  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name,
        category: product.category,
        brand: product.brand || '',
      });
    } else if (!product && isOpen) {
      reset({
        name: '',
        category: '',
        brand: '',
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
        {/* Nombre del Producto */}
        <Input
          label="Nombre del producto"
          placeholder="Ej: Arroz Diana 1kg"
          autoFocus
          disabled={isLoading}
          error={errors.name?.message}
          helperText={!errors.name ? 'Usa un nombre descriptivo.' : undefined}
          {...register('name')}
        />

        {/* Categoría (Único método de selección) */}
        <Select
          label="Categoría"
          placeholder="Selecciona categoría"
          options={Object.keys(categoryConfig).map((key) => ({
            value: key,
            label: key,
          }))}
          disabled={isLoading}
          error={errors.category?.message}
          {...register('category')}
        />

        {/* Marca */}
        <Input
          label="Marca (opcional)"
          placeholder="Ej: Diana, Alpina, Colanta"
          disabled={isLoading}
          error={errors.brand?.message}
          helperText={!errors.brand ? 'Ayuda a identificar mejor el producto.' : undefined}
          {...register('brand')}
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