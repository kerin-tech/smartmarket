'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { productSchema, ProductFormValues } from '@/lib/validations/product';

const CATEGORIES = ['Frutas', 'Verduras', 'Carnes', 'Lácteos', 'Granos', 'Bebidas', 'Limpieza', 'Otros'];
const UNITS = [
  { val: 'kg', label: 'kg' },
  { val: 'gr', label: 'gr' },
  { val: 'lt', label: 'lt' },
  { val: 'ml', label: 'ml' },
  { val: 'unidad', label: 'unidad' }
];

interface Props {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const ProductForm = ({ initialData, onSubmit, isLoading, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: initialData || { unit: 'unidad' }
  });

  const selectedCategory = watch('category');
  const selectedUnit = watch('unit');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {/* Nombre del Producto */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Nombre del producto *</label>
        <input
          {...register('name')}
          autoFocus
          placeholder="Ej: Arroz Diana 1kg"
          className={`w-full p-4 rounded-xl border-2 transition-all outline-none ${
            errors.name ? 'border-error-main bg-error-50/10' : 'border-gray-200 focus:border-primary-600'
          }`}
        />
        {errors.name ? (
          <p className="text-xs text-error-main font-semibold">{errors.name.message}</p>
        ) : (
          <p className="text-xs text-gray-500">Usa un nombre descriptivo para identificarlo fácilmente.</p>
        )}
      </div>

      {/* Marca */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Marca (Opcional)</label>
        <input
          {...register('brand')}
          placeholder="Ej: Diana, Colanta..."
          className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-600 outline-none transition-all"
        />
      </div>

      {/* Chips de Categoría */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700">Categoría *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setValue('category', cat, { shouldValidate: true })}
              className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {errors.category && <p className="text-xs text-error-main font-semibold">{errors.category.message}</p>}
      </div>

      {/* Chips de Unidad */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700">Unidad de medida *</label>
        <div className="flex flex-wrap gap-2">
          {UNITS.map((u) => (
            <button
              key={u.val}
              type="button"
              onClick={() => setValue('unit', u.val, { shouldValidate: true })}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                selectedUnit === u.val
                  ? 'border-primary-600 bg-primary-50 text-primary-600'
                  : 'border-transparent bg-gray-100 text-gray-500'
              }`}
            >
              {selectedUnit === u.val && <Check size={16} />}
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button 
          type="button" 
          variant="ghost" 
          className="flex-1 py-6 order-2 sm:order-1"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          className="flex-1 py-6 gap-2 order-1 sm:order-2"
          disabled={!isValid || isLoading}
        >
          {isLoading && <Loader2 className="animate-spin" size={20} />}
          {initialData ? 'Guardar cambios' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  );
};
