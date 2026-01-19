// src/components/layout/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Store,
  ShoppingCart,
  History,
  BarChart3,
  User,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { routes } from '@/config/app.config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: routes.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: routes.products,
    icon: Package,
  },
  {
    label: 'Locales',
    href: routes.stores,
    icon: Store,
  },
  {
    label: 'Compras',
    href: routes.purchases,
    icon: ShoppingCart,
  },
  {
    label: 'Historial',
    href: routes.history,
    icon: History,
  },
  {
    label: 'Comparar',
    href: routes.compare,
    icon: BarChart3,
    badge: 'Nuevo',
  },
];

const secondaryNavItems: NavItem[] = [
  {
    label: 'Mi perfil',
    href: routes.profile,
    icon: User,
  },
  {
    label: 'Ayuda',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-secondary-200 flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-secondary-200">
          <Logo size="md" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Main navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      active ? 'text-primary-600' : 'text-secondary-400'
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-secondary-200" />

          {/* Secondary navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      active ? 'text-primary-600' : 'text-secondary-400'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-secondary-200">
          <div className="rounded-lg bg-primary-50 p-4">
            <p className="text-sm font-medium text-primary-900">
              SmartMarket Pro
            </p>
            <p className="text-xs text-primary-700 mt-1">
              Desbloquea funciones premium
            </p>
            <button className="mt-3 w-full px-3 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              Actualizar ahora
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
