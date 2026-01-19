// src/components/layout/BottomNav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { routes } from '@/config/app.config';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    label: 'Inicio',
    href: routes.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: routes.products,
    icon: Package,
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
    label: 'Perfil',
    href: routes.profile,
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-secondary-200 lg:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors',
                active
                  ? 'text-primary-600'
                  : 'text-secondary-400 hover:text-secondary-600'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary-600')} />
              <span className={cn(
                'text-xs mt-1',
                active ? 'font-medium' : 'font-normal'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
