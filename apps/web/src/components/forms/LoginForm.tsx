// src/components/forms/LoginForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

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
  const { isAuthenticated, setAuth, setLoading } = useAuthStore();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // Validación al enviar
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirigir si ya hay sesión activa
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

      // Guardar autenticación en el store
      setAuth(response.user, response.token);

      // Si marcó "Recordarme", el token ya se guarda en localStorage por defecto
      // Si no lo marcó, podríamos usar sessionStorage en su lugar (implementación futura)

      // Mostrar mensaje de éxito
      success(`¡Bienvenido de nuevo, ${response.user.name}!`);

      // Redireccionar al dashboard
      setTimeout(() => {
        router.push(routes.dashboard);
      }, 1000);
    } catch (err) {
      const apiError = err as ApiError;

      // Manejar errores de credenciales
      if (apiError.statusCode === 401 || apiError.statusCode === 404) {
        setGeneralError('Correo electrónico o contraseña incorrectos');
      } else if (apiError.statusCode === 429) {
        setGeneralError('Demasiados intentos. Por favor, espera unos minutos.');
      } else {
        setGeneralError(
          apiError.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Error general */}
        {generalError && (
          <div
            className="rounded-lg bg-error-50 border border-error-200 p-4 text-sm text-error-700"
            role="alert"
          >
            {generalError}
          </div>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          disabled={isSubmitting}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="Tu contraseña"
          autoComplete="current-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Recordarme"
            disabled={isSubmitting}
            {...register('rememberMe')}
          />
          <Link
            href={routes.forgotPassword}
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <LogIn className="h-5 w-5" /> : undefined}
        >
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-600">
        ¿No tienes cuenta?{' '}
        <Link href={routes.register} className="link font-medium">
          Regístrate
        </Link>
      </p>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
