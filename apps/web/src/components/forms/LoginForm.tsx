// src/components/forms/LoginForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LogIn, AlertCircle } from 'lucide-react'; // Añadido AlertCircle

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { routes } from '@/config/app.config';
import type { ApiError } from '@/types/auth.types';

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const { toasts, removeToast, success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(routes.dashboard);
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      setAuth(response.user, response.token);
      success(`¡Bienvenido de nuevo, ${response.user.name}!`);

      setTimeout(() => {
        router.push(routes.dashboard);
      }, 1000);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 401 || apiError.statusCode === 404) {
        setGeneralError('Correo electrónico o contraseña incorrectos');
      } else if (apiError.statusCode === 429) {
        setGeneralError('Demasiados intentos. Por favor, espera unos minutos.');
      } else {
        setGeneralError(apiError.message || 'Error al iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        
        {/* --- CUADRO DE ERROR GENERAL (Basado en el estilo de tus Toasts) --- */}
        {generalError && (
          <div
            className={cn(
              "flex items-center gap-3 w-full p-4 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2",
              "bg-red-50 border-red-200 text-red-800", // Estilo Light
              "dark:bg-red-950/30 dark:border-red-900 dark:text-red-300" // Estilo Dark (sacado de tu Toast)
            )}
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
            <p className="flex-1 text-sm font-bold leading-tight">
              {generalError}
            </p>
          </div>
        )}

        {/* ... (resto de los Inputs: Email y Password) */}

        <Input
          label="Correo electrónico"
          {...register('email')}
          error={errors.email?.message}
          // Asegúrate de que tu componente Input use el color 'danger' o 'red' para el texto de error
        />

        <Input
          label="Contraseña"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Recordarme" {...register('rememberMe')} />
          <Link
            href={routes.forgotPassword}
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<LogIn className="h-5 w-5" />}
        >
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href={routes.register} className="text-primary-600 hover:underline font-bold">
          Regístrate
        </Link>
      </p>

      {/* Renderizado de Toasts de éxito o errores globales */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
