// src/app/(auth)/login/page.tsx

import { Metadata } from 'next';
import { LoginForm } from '@/components/forms/LoginForm';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Iniciar sesión | SmartMarket',
  description: 'Inicia sesión en SmartMarket para gestionar tus compras y comparar precios',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">Bienvenido de nuevo</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
