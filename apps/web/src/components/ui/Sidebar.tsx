'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, BarChart3, User, LogOut, Package } from 'lucide-react';

const MENU_ITEMS = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Mis Productos', href: '/products' },
  { icon: ShoppingBag, label: 'Compras', href: '/purchases' },
  { icon: BarChart3, label: 'Historial', href: '/history' },
  { icon: User, label: 'Mi Perfil', href: '/profile' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40 hidden lg:flex">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-primary-600">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">SM</div>
          <span className="text-xl font-bold tracking-tight text-gray-900">SmartMarket</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 font-semibold hover:bg-error-50 hover:text-error-main rounded-xl transition-all">
          <LogOut size={22} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
