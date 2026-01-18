'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Store, 
  BarChart3, 
  History, 
  User, 
  LogOut 
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Compras', icon: ShoppingCart, href: '/purchases' },
  { label: 'Productos', icon: Package, href: '/products' },
  { label: 'Locales', icon: Store, href: '/stores' },
  { label: 'Comparar', icon: BarChart3, href: '/compare' },
  { label: 'Historial', icon: History, href: '/history' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navegación Principal */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {MENU_ITEMS.map((item) => {
          // Detectamos si la ruta actual empieza con el href del item 
          // (útil para que /products/new mantenga activo "Productos")
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group ${
                isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon 
                size={22} 
                className={`${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-900'}`} 
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar: Perfil y Salir */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-500 hover:bg-gray-50 transition-all"
        >
          <User size={22} />
          Perfil
        </Link>
        <button
          onClick={() => console.log('Cerrar sesión')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-error-main hover:bg-error-50 transition-all"
        >
          <LogOut size={22} />
          Salir
        </button>
      </div>
    </div>
  );
};