'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Plus, BarChart3, User } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: ShoppingBag, label: 'Compras', href: '/purchases' },
  { icon: Plus, label: 'Nueva', href: '/products/new', isCenter: true },
  { icon: BarChart3, label: 'Comparar', href: '/compare' },
  { icon: User, label: 'Perfil', href: '/profile' },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-gray-200 shadow-bottom-nav flex justify-around items-center z-40 lg:hidden pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 transition-transform active:scale-95 ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <item.icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={isActive ? 'text-primary-600' : 'text-gray-400'}
            />
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
