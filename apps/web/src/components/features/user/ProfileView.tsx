'use client';

import { useEffect, useState, useCallback } from 'react';
import { getInitials, formatMemberSince } from '@/utils/user-formatters';
import { Skeleton } from '@/components/ui/Skeleton'; 
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/user.types';

export function ProfileView() {
  const { toasts, removeToast, error: showError } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getProfile();
      setUser(data);
    } catch (err: any) {
      showError(err.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32 bg-muted rounded-md" /> 
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
          </div>
        </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Título consistente con CompareView */}
      <h1 className="text-2xl font-bold text-foreground">Perfil</h1>

      {user ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Card de Usuario: Estilo idéntico a ProductCard */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-sm transition-colors">
            <div className="flex items-center gap-4">
              {/* Avatar con estilo de caja de emoji */}
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                <span className="text-xl font-bold text-primary-700">
                    {getInitials(user.name)}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground leading-tight">
                  {user.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[13px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                    {user.email}
                  </span>
                  <span className="text-[13px] text-muted-foreground/80">
                    · {formatMemberSince(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de información adicional (Opcional, estilo estadístico) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">ID de Usuario</p>
              <p className="text-sm font-mono text-foreground truncate">{user.id}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Estado de Cuenta</p>
              <span className="w-auto text-xs font-medium text-success-600 bg-success-100 px-1.5 py-0.5 rounded">Activa</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
          No se pudo cargar la información del usuario.
        </div>
      )}
      
      <footer className="mt-8 py-4 text-center">
        <p className="text-[12px] text-muted-foreground">SmartMarket · Versión 1.0.0</p>
      </footer>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}