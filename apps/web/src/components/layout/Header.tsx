// src/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { routes } from '@/config/app.config';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push(routes.login);
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-color">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Logo - visible on mobile */}
          <div className="lg:hidden">
            <Logo size="sm" showText={false} />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <ThemeToggle />
          <button
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {/* Badge de notificación */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {user?.name || 'Usuario'}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isProfileOpen && "rotate-180"
              )} />
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl border border-color shadow-lg z-20 py-1 animate-scale-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-color">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href={routes.profile}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Mi perfil
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        // TODO: Abrir configuración
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configuración
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-color py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
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
