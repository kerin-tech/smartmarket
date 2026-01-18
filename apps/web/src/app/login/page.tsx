'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { loginSchema, LoginFormData } from '@/types/auth';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        // Simulación de autenticación (FE-02 UX: Loader durante petición)
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Login exitoso:', data);

        // Simulación de almacenamiento (BE-02 guardará el token real)
        localStorage.setItem('token', 'fake-jwt-token');

        // Redirección automática a dashboard
        router.push('/dashboard');

        // ... dentro del componente:
        useEffect(() => {
            const token = localStorage.getItem('token');
            if (token) {
                router.push('/dashboard');
            }
        }, [router]);

    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fade-in">
                <header className="text-center mb-10">
                    <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-600 font-bold text-2xl">SM</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
                    <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Correo electrónico"
                        icon={Mail}
                        type="email"
                        placeholder="tu@correo.com"
                        {...register('email')}
                        error={errors.email?.message}
                    />

                    <div className="space-y-1">
                        <Input
                            label="Contraseña"
                            icon={Lock}
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={errors.password?.message}
                        />
                        <div className="flex justify-end">
                            <Link href="/forgot-password" title="Próximamente" className="text-xs text-primary-600 hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            {...register('rememberMe')}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        <label htmlFor="rememberMe" className="text-sm text-gray-600">Recordarme</label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-primary"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Validando...
                            </span>
                        ) : (
                            <>
                                Iniciar sesión
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                <footer className="mt-8 text-center text-sm">
                    <span className="text-gray-500">¿No tienes cuenta? </span>
                    <Link href="/register" className="text-primary-600 font-bold hover:underline underline-offset-4">
                        Regístrate
                    </Link>
                </footer>
            </div>
        </div>
    );
}