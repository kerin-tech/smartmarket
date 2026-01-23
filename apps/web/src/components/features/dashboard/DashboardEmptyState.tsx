// src/components/features/dashboard/DashboardEmptyState.tsx

'use client';

import Link from 'next/link';
import { BarChart3, Plus, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardEmptyStateProps {
  userName: string;
}

export function DashboardEmptyState({ userName }: DashboardEmptyStateProps) {
  // Obtener primer nombre
  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Saludo - con animación */}
      <h1 
        className="text-2xl lg:text-4xl font-bold text-secondary-900 animate-[fadeInUp_400ms_ease-out]"
      >
        ¡Hola, {firstName}! 👋
      </h1>

      {/* Card Empty State - con delay */}
      <div 
        className="bg-white border border-secondary-200 rounded-xl p-8 lg:p-12 text-center max-w-lg mx-auto lg:mx-0 animate-[fadeInUp_400ms_ease-out_100ms_backwards]"
      >
        {/* Ilustración */}
        <div className="w-40 h-40 lg:w-52 lg:h-52 mx-auto mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-secondary-100 flex items-center justify-center">
              <BarChart3 className="h-16 w-16 lg:h-20 lg:w-20 text-secondary-300" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Aún no tienes compras
        </h2>

        {/* Descripción */}
        <p className="text-secondary-500 mb-6 max-w-xs mx-auto">
          Registra tu primera compra para comenzar a ver tus estadísticas de gastos.
        </p>

        {/* CTA Primario */}
        <Link href="/purchases" className="block">
          <Button
            size="lg"
            className="w-full"
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Registrar mi primera compra
          </Button>
        </Link>
      </div>

      {/* Tip Card - con más delay */}
      <div 
        className="bg-primary-50 rounded-xl p-4 max-w-lg mx-auto lg:mx-0 animate-[fadeInUp_400ms_ease-out_200ms_backwards]"
      >
        <p className="text-primary-800 text-sm mb-3">
          <span className="mr-2">💡</span>
          <strong>Tip:</strong> Puedes agregar los productos y locales que más usas antes de tu primera compra.
        </p>
        <div className="flex gap-3">
          <Link href="/products">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Package className="h-4 w-4" />}
            >
              Productos
            </Button>
          </Link>
          <Link href="/stores">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MapPin className="h-4 w-4" />}
            >
              Locales
            </Button>
          </Link>
        </div>
      </div>

      {/* Keyframes para la animación (se puede mover a globals.css) */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}