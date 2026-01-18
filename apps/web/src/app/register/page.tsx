'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { registerSchema, RegisterFormData } from '@/types/auth';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange' // Validación en tiempo real como pide la UX
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Simulación de carga (Loader/Spinner)
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Usuario registrado:', data);
    // Aquí irá la redirección tras el éxito
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <header className="text-center mb-10">
          <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <span className="text-primary-600 font-bold text-2xl">SM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
          <p className="text-gray-500 mt-2">Únete a SmartMarket y empieza a optimizar tus compras.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Nombre" icon={User} placeholder="Ej. Juan Pérez" {...register('name')} error={errors.name?.message} />
          <Input label="Email" icon={Mail} type="email" placeholder="tu@correo.com" {...register('email')} error={errors.email?.message} />
          <Input label="Contraseña" icon={Lock} type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
          <Input label="Confirmar" icon={Lock} type="password" placeholder="••••••••" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-primary"
          >
            {isSubmitting ? 'Procesando...' : (
              <>
                Comenzar ahora
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <footer className="mt-8 text-center text-sm">
          <span className="text-gray-500">¿Ya tienes una cuenta? </span>
          <Link href="/login" className="text-primary-600 font-bold hover:underline underline-offset-4">
            Inicia sesión
          </Link>
        </footer>
      </div>
    </div>
  );
}