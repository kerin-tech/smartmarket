// src/app/(auth)/register/page.tsx

import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Logo } from '@/components/layout/Logo';
import { routes } from '@/config/app.config';

export const metadata: Metadata = {
  title: 'Crear cuenta | SmartMarket',
  description:
    'Crea tu cuenta en SmartMarket y empieza a comparar precios de tus compras del hogar',
};

export default function RegisterPage() {
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
            <h1 className="text-2xl font-bold text-secondary-900">Crea tu cuenta</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Empieza a comparar precios y ahorra en tus compras
            </p>
          </div>

          {/* Form */}
          <RegisterForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-secondary-500">
          Al crear tu cuenta, aceptas nuestros{' '}
          <Link href={routes.terms} className="link">
            Términos de servicio
          </Link>{' '}
          y{' '}
          <Link href={routes.privacy} className="link">
            Política de privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
