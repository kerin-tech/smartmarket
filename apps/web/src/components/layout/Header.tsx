// src/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  User, 
  LogOut, 
  ChevronDown,
  Menu, // Nuevo import
  X     // Nuevo import
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { routes } from '@/config/app.config';

// Definimos la interfaz para recibir las props desde DashboardLayout
interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Lógica para el nombre de la página en Mobile
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const segment = pathname.split('/')[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push(routes.login);
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-color transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        
        {/* --- SECCIÓN IZQUIERDA --- */}
        <div className="flex items-center gap-4">
          
          {/* Botón Toggle Sidebar (Solo Mobile) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Mobile: Logo SMK */}
          <div className="lg:hidden">
            <Logo size="sm" showText={false} />
          </div>

          {/* Web: Breadcrumb (Simple) */}
          <nav className="hidden lg:flex items-center text-sm font-medium">
            <span className="text-muted-foreground">App</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{getPageTitle()}</span>
          </nav>
        </div>

        {/* --- SECCIÓN CENTRO (Mobile Only) --- */}
        <div className="lg:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {getPageTitle()}
          </h1>
        </div>

        {/* --- SECCIÓN DERECHA --- */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                <span className="text-sm font-bold text-primary-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform hidden sm:block",
                isProfileOpen && "rotate-180"
              )} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-card rounded-xl border border-color shadow-lg z-20 py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-color bg-muted/30">
                    <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href={routes.profile}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Mi perfil
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30 transition-colors border-t border-color"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}