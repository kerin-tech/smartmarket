'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { routes } from '@/config/app.config';
import type { ApiError } from '@/types/auth.types';

const validRegisterFields = ['name', 'email', 'password', 'confirmPassword'];

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setAuth(response.user, response.token);
      success('¡Cuenta creada! Bienvenido a SmartMarket');

      setTimeout(() => {
        router.push(routes.dashboard);
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;
      
      if (apiError.statusCode === 409) {
        setError('email', { message: 'Este correo ya está registrado' });
      } else if (apiError.errors) {
        apiError.errors.forEach((fe) => {
          if (fe.field && validRegisterFields.includes(fe.field)) {
            setError(fe.field as any, { message: fe.message });
          }
        });
      } else {
        setGeneralError(apiError.message || 'Error al crear la cuenta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {generalError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300 animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">{generalError}</p>
          </div>
        )}

        <div className="space-y-3">
          <Input
            label="Nombre"
            placeholder="Ej: Juan Pérez"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="tu@correo.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
            error={errors.password?.message}
          />

          <Input
            label="Confirmar"
            type="password"
            placeholder="Repite tu contraseña"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="rounded-xl font-bold h-12"
          >
            Registrarme
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href={routes.login} className="text-primary-600 font-bold hover:underline">
          Inicia sesión
        </Link>
      </p>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}