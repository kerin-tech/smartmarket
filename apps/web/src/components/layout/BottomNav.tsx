// src/components/layout/BottomNav.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Scale,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { routes } from '@/config/app.config';

const navItems = [
  { label: 'Inicio', href: routes.dashboard, icon: LayoutDashboard },
  { label: 'Compras', href: routes.purchases, icon: ShoppingCart },
  { label: 'Historial', href: routes.history, icon: History },
  { label: 'Comparar', href: '/compare', icon: Scale },
  { label: 'Perfil', href: routes.profile, icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 15) return;

      if (currentScrollY > lastScrollY && currentScrollY > 100) { 
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const checkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav 
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md transition-all duration-500 ease-in-out',
        'bg-card/80 backdrop-blur-lg border border-border shadow-2xl rounded-2xl lg:hidden',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = checkActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-90',
                active ? 'text-primary-500' : 'text-muted-foreground'
              )}
            >
              {/* Indicador sutil debajo del icono */}
              <Icon className={cn('h-5 w-5 mb-1 transition-transform', active && 'stroke-[2.5px] scale-110')} />
              
              <span className={cn(
                'text-[11px] font-semibold tracking-wide transition-opacity',
                active ? 'opacity-100' : 'opacity-80'
              )}>
                {item.label}
              </span>

              {/* Barra de estado activa en la parte inferior */}
              {active && (
                <div className="absolute bottom-1 w-5 h-0.5 bg-primary-500 rounded-full animate-in fade-in slide-in-from-bottom-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}