// src/app/(dashboard)/page.tsx

'use client';

import Link from 'next/link';
import { 
  Package, 
  Store, 
  ShoppingCart, 
  TrendingUp,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { routes } from '@/config/app.config';

// Stats cards data
const stats = [
  {
    label: 'Productos',
    value: '24',
    change: '+3 este mes',
    icon: Package,
    color: 'bg-primary-100 text-primary-600',
    href: routes.products,
  },
  {
    label: 'Locales',
    value: '5',
    change: '+1 nuevo',
    icon: Store,
    color: 'bg-warning-100 text-warning-600',
    href: routes.stores,
  },
  {
    label: 'Compras',
    value: '12',
    change: 'Este mes',
    icon: ShoppingCart,
    color: 'bg-success-100 text-success-600',
    href: routes.purchases,
  },
  {
    label: 'Ahorro',
    value: '$45.000',
    change: '+15% vs mes anterior',
    icon: TrendingUp,
    color: 'bg-info-100 text-info-600',
    href: routes.history,
  },
];

// Quick actions
const quickActions = [
  {
    label: 'Nueva compra',
    description: 'Registra una compra del mercado',
    icon: ShoppingCart,
    href: routes.newPurchase,
    color: 'bg-success-500',
  },
  {
    label: 'Nuevo producto',
    description: 'Agrega un producto a tu lista',
    icon: Package,
    href: routes.newProduct,
    color: 'bg-primary-500',
  },
  {
    label: 'Nuevo local',
    description: 'Registra un supermercado',
    icon: Store,
    href: routes.newStore,
    color: 'bg-warning-500',
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-secondary-500 mt-1">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card
                className="p-4 hover:shadow-card-hover transition-shadow cursor-pointer h-full"
                padding="none"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-secondary-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-secondary-500 mt-0.5">
                    {stat.label}
                  </p>
                </div>
                <p className="text-xs text-secondary-400 mt-2">
                  {stat.change}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card
                  className="p-4 hover:shadow-card-hover transition-all cursor-pointer group h-full"
                  padding="none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${action.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-sm text-secondary-500 truncate">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">
            Actividad reciente
          </h2>
          <Link 
            href={routes.history}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todo
          </Link>
        </div>
        <Card className="p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary-100 flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-secondary-400" />
          </div>
          <h3 className="font-medium text-secondary-900 mb-2">
            Sin actividad reciente
          </h3>
          <p className="text-sm text-secondary-500 mb-4 max-w-sm mx-auto">
            Registra tu primera compra para empezar a ver tu historial y comparar precios.
          </p>
          <Button leftIcon={<Plus className="h-5 w-5" />}>
            <Link href={routes.newPurchase}>Registrar compra</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
