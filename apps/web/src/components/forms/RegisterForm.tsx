// src/components/forms/RegisterForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { routes } from '@/config/app.config';
import type { ApiError } from '@/types/auth.types';

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Validación al perder foco
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Guardar autenticación en el store
      setAuth(response.user, response.token);

      // Mostrar mensaje de éxito
      success('¡Cuenta creada exitosamente! Bienvenido a SmartMarket');

      // Redireccionar al dashboard después de un breve delay
      setTimeout(() => {
        router.push(routes.dashboard);
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;

      // Manejar error de email duplicado
      if (apiError.statusCode === 409 || apiError.message?.toLowerCase().includes('email')) {
        setError('email', {
          type: 'manual',
          message: 'Este correo electrónico ya está registrado',
        });
      } else if (apiError.errors && apiError.errors.length > 0) {
        // Mapear errores de campo específicos del servidor
        apiError.errors.forEach((fieldError) => {
          if (fieldError.field && fieldError.field in registerSchema.shape) {
            setError(fieldError.field as keyof RegisterFormValues, {
              type: 'manual',
              message: fieldError.message,
            });
          }
        });
      } else {
        // Error general
        showError(apiError.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // El botón está deshabilitado si hay errores o si no es válido
  const isButtonDisabled = !isValid || Object.keys(errors).length > 0;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Ej: Juan Pérez"
          autoComplete="name"
          disabled={isSubmitting}
          error={touchedFields.name ? errors.name?.message : undefined}
          {...register('name')}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          disabled={isSubmitting}
          error={touchedFields.email ? errors.email?.message : undefined}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={touchedFields.password ? errors.password?.message : undefined}
          helperText={
            !errors.password && !touchedFields.password
              ? 'Debe incluir mayúscula, minúscula y número'
              : undefined
          }
          {...register('password')}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          disabled={isButtonDisabled}
          leftIcon={!isSubmitting ? <UserPlus className="h-5 w-5" /> : undefined}
        >
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-600">
        ¿Ya tienes cuenta?{' '}
        <Link href={routes.login} className="link font-medium">
          Inicia sesión
        </Link>
      </p>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
