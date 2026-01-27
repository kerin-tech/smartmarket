import { Metadata } from 'next';
import { LoginForm } from '@/components/forms/LoginForm';
import { Logo } from '@/components/layout/Logo';
import { routes } from '@/config/app.config';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Iniciar sesión | SmartMarket',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center flex-col md:items-center md:justify-center bg-card px-6 py-12 md:px-4">
      <div className="w-full max-w-md">
        {/* Contenedor que actúa como "modal" solo en escritorio */}
        <div className="md:bg-card md:p-8 md:rounded-2xl md:shadow-soft-xl md:border md:border-border">
          
          {/* Logo */}
          <div className="flex justify-start md:justify-center mb-10">
            <Logo size="lg" />
          </div>

          {/* Header ajustado sin salto de línea forzado */}
          <div className="mb-10 text-left md:text-center">
            <h1 className="mr-4 text-4xl md:text-xl font-bold text-foreground tracking-tight">
              ¡Hola! <span className="font-normal">Qué bueno verte de nuevo.</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground font-normal">
              Ingresa tus datos para continuar.
            </p>
          </div>

          {/* Formulario */}
          <LoginForm />
        </div>

         {/* Footer Legal */}
        <p className="mt-8 text-center text-xs text-muted-foreground px-0 md:px-4 ">
          Al iniciar sesión, aceptas nuestros{' '}
          <Link href={routes.terms} className="text-primary-600 hover:underline">
            Términos
          </Link>{' '}
          y{' '}
          <Link href={routes.privacy} className="text-primary-600 hover:underline">
            Privacidad
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground px-4 ">
          Development by Kerin Melo © 2026
        </p>
      </div>
    </div>
  );
}