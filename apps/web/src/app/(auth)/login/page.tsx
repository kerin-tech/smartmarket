import { Metadata } from 'next';
import { LoginForm } from '@/components/forms/LoginForm';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Iniciar sesión | SmartMarket',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:items-center md:justify-center bg-card px-6 py-12 md:px-4">
      <div className="w-full max-w-md">
        {/* Contenedor que actúa como "modal" solo en escritorio */}
        <div className="md:bg-card md:p-8 md:rounded-2xl md:shadow-soft-xl md:border md:border-border">
          
          {/* Logo */}
          <div className="flex justify-start md:justify-center mb-10">
            <Logo size="lg" />
          </div>

          {/* Header ajustado sin salto de línea forzado */}
          <div className="mb-10 text-left md:text-center">
            <h1 className="mr-4 text-3xl md:text-2xl font-bold text-foreground tracking-tight">
              ¡Hola! <span className='font-medium'>Qué bueno verte de nuevo</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-medium">
              Ingresa tus datos para continuar
            </p>
          </div>

          {/* Formulario */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}