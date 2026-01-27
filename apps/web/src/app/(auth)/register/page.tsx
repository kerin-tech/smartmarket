import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Logo } from '@/components/layout/Logo';
import { routes } from '@/config/app.config';

export const metadata: Metadata = {
  title: 'Crear cuenta | SmartMarket',
};

export default function RegisterPage() {
  return (
    /* Background general usando bg-card */
    <div className="min-h-screen flex flex-col md:items-center md:justify-center bg-card px-6 py-8 md:px-4">
      <div className="w-full max-w-md">
        
        {/* Botón Atrás - Visible en mobile y desktop para registro */}
        <Link 
          href={routes.login} 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <div className="p-2 rounded-full border border-border group-hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Volver</span>
        </Link>

        {/* Contenedor tipo Modal solo en Desktop */}
        <div className="md:bg-card md:p-8 md:rounded-2xl md:shadow-soft-xl md:border md:border-border">
          
          <div className="flex justify-start md:justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="mb-8 text-left md:text-center">
            <h1 className="text-3xl md:text-2xl font-bold text-foreground tracking-tight">
              Crea tu cuenta ahora
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-medium">
              Únete y empieza a ahorrar en tus compras
            </p>
          </div>

          <RegisterForm />
        </div>

        {/* Footer Legal */}
        <p className="mt-8 text-center text-xs text-muted-foreground px-4">
          Al crear tu cuenta, aceptas nuestros{' '}
          <Link href={routes.terms} className="text-primary-600 hover:underline">
            Términos
          </Link>{' '}
          y{' '}
          <Link href={routes.privacy} className="text-primary-600 hover:underline">
            Privacidad
          </Link>
        </p>
         <p className="mt-2 text-center text-xs text-muted-foreground px-4">
          Development by Kerin Melo © 2026
        </p>
      </div>
    </div>
  );
}