'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Circle } from 'lucide-react';

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
  const { toasts, removeToast, success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password', '');

  // Reglas de validación
  const passwordRules = [
    { label: 'Al menos 8 caracteres', test: passwordValue.length >= 8 },
    { label: 'Una letra minúscula', test: /[a-z]/.test(passwordValue) },
    { label: 'Una letra mayúscula', test: /[A-Z]/.test(passwordValue) },
    { label: 'Un número o símbolo (!@#$)', test: /[0-9!@#$%^&*]/.test(passwordValue) },
  ];

  const strengthScore = passwordRules.filter((rule) => rule.test).length;
  const strengthLabels = ['Insegura', 'Muy Débil', 'Débil', 'Media', 'Segura'];
  const strengthColors = ['bg-muted', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

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
      success('¡Bienvenido a SmartMarket!');
      setTimeout(() => router.push(routes.dashboard), 1500);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 409) {
        setError('email', { message: 'Este correo ya existe' });
      } else {
        setGeneralError(apiError.message || 'Error al registrarse');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {generalError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-800 border-red-600 text-red-50 animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold leading-tight">{generalError}</p>
          </div>
        )}

        <div className="space-y-3">
          <Input label="Nombre" placeholder="Tu nombre completo" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" placeholder="tu@correo.com" {...register('email')} error={errors.email?.message} />

          {/* Password con Checklist de una columna y tipografía grande */}
          <div className="space-y-4">
            <Input label="Contraseña" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            
            <div className="space-y-3 px-1">
              {/* Info de seguridad */}
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">Nivel de seguridad</p>
                  <p className={cn("text-sm font-bold transition-colors", strengthScore > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {strengthLabels[strengthScore]}
                  </p>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{strengthScore}/4</span>
              </div>
              
              {/* Barra de progreso */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className={cn(
                      "h-full w-1/4 transition-all duration-500",
                      strengthScore >= step ? strengthColors[strengthScore] : "bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Lista Vertical Grande */}
              <div className="flex flex-col gap-2.5 pt-1">
                {passwordRules.map((rule, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-3 text-sm transition-all duration-300",
                    rule.test ? "text-green-400 font-medium" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-full border transition-all",
                      rule.test ? "bg-green-600 border-green-600" : "bg-transparent border-muted-foreground/20"
                    )}>
                      {rule.test ? (
                        <Check className="h-3 w-3 stroke-[4px] text-green-200"/>
                      ) : (
                        <Circle className="h-2 w-2 fill-muted-foreground/20 stroke-none" />
                      )}
                    </div>
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Input label="Confirmar" type="password" placeholder="Repite tu contraseña" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        </div>

        <div className="pt-4">
          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={!isValid || isSubmitting} className="rounded-xl font-bold h-12">
            Crear cuenta
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