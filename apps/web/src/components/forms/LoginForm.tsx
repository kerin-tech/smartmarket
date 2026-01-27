'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

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
    formState: { errors, touchedFields },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched', // Cambiado a onTouched para que valide mientras el usuario interactúa
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
      success(`¡Bienvenido, ${response.user.name}!`);

      setTimeout(() => {
        router.push(routes.dashboard);
      }, 1000);
    } catch (err) {
      const apiError = err as ApiError;
      setGeneralError(apiError.message || 'Credenciales incorrectas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {generalError && (
          <div
            className={cn(
              "flex items-center gap-3 w-full p-4 rounded-xl border animate-in fade-in slide-in-from-top-2",
              "bg-red-800 border-red-600 text-red-200"
            )}
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-200" />
            <p className="text-sm font-bold leading-tight">{generalError}</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            type="email"
            {...register('email')}
            error={errors.email?.message} 
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        <div className="flex items-center">
          <Checkbox 
            label="Recordarme en este dispositivo" 
            {...register('rememberMe')} 
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            className="rounded-xl font-bold h-12"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{' '}
        <Link href={routes.register} className="text-primary-700 hover:text-primary-900 hover:underline font-medium transition-colors">
          Regístrate ahora
        </Link>
      </p>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}