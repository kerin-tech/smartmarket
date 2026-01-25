'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Plus, Package, MapPin, Lightbulb, ChevronRight, Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DashboardEmptyStateProps {
  userName: string;
}

const TIPS = [
  {
    id: 1,
    text: "Puedes adelantar trabajo agregando los productos que más compras habitualmente.",
    icon: <Package className="h-5 w-5 text-amber-500" />
  },
  {
    id: 2,
    text: "Organiza tus locales favoritos para registrar compras mucho más rápido.",
    icon: <Store className="h-5 w-5 text-blue-500" />
  },
  {
    id: 3,
    text: "El historial te permitirá comparar cuánto ha subido la inflación en tus productos.",
    icon: <BarChart3 className="h-5 w-5 text-emerald-500" />
  }
];

export function DashboardEmptyState({ userName }: DashboardEmptyStateProps) {
  const firstName = userName.split(' ')[0];
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-700 pb-10">
      
      {/* 1. Saludo */}
      <div className="space-y-1">
        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
          ¡Hola, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">Bienvenido a tu panel de control.</p>
      </div>

      {/* 2. Stacked Tips Carousel (Debajo del saludo) */}
      <div className="relative h-24 w-full">
        {TIPS.map((tip, index) => {
          const isActive = index === currentTip;
          return (
            <div
              key={tip.id}
              className={cn(
                "absolute inset-0 bg-card border border-border rounded-2xl p-5 flex items-center gap-4 transition-all duration-700 ease-in-out",
                isActive 
                  ? "opacity-100 translate-y-0 scale-100 z-20" 
                  : "opacity-0 translate-y-4 scale-95 z-10"
              )}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                {tip.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {tip.text}
                </p>
              </div>
              
              {/* Barra de progreso de tiempo (Sustituye a los puntos) */}
              {isActive && (
                <div className="absolute bottom-1.5 left-0 h-1 bg-primary-200/10 px-2 w-full overflow-hidden rounded-r-full">
                  <div className="h-full bg-primary-300 rounded-full animate-[progress_6s_linear]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Main Card - Registro de Compra */}
      <div className="bg-card border border-border rounded-[2rem] p-8 lg:p-12 text-center shadow-sm relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 relative">
          <BarChart3 className="h-10 w-10 text-primary-600" />
          
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">
          Aún no tienes compras
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
          Registra tu primera compra para ver tus estadísticas de gastos.
        </p>

        <Link href="/purchases" className="inline-block w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:px-10 shadow-xl shadow-primary/10 font-bold"
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Registrar mi primera compra
          </Button>
        </Link>
      </div>

      {/* 4. Action Cards - Productos y Tiendas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/products" className="group">
          <div className="bg-card border border-border p-5 rounded-[1.5rem] flex items-center gap-4 transition-all hover:border-primary-200 hover:shadow-md active:scale-[0.98]">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground leading-tight">Productos</h3>
              <p className="text-xs text-muted-foreground">Gestionar catálogo</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/stores" className="group">
          <div className="bg-card border border-border p-5 rounded-[1.5rem] flex items-center gap-4 transition-all hover:border-primary-200 hover:shadow-md active:scale-[0.98]">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Store className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground leading-tight">Locales</h3>
              <p className="text-xs text-muted-foreground">Puntos de venta</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}