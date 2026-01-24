// src/components/layout/DashboardLayout.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { routes } from '@/config/app.config';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FullPageLoader } from '@/components/ui/Spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth check
  useEffect(() => {
    if (isMounted && isInitialized && !isAuthenticated) {
      router.push(routes.login);
    }
  }, [isMounted, isInitialized, isAuthenticated, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Show loader while checking auth
  if (!isMounted || !isInitialized) {
    return <FullPageLoader />;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Sidebar - fixed position */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content wrapper - offset by sidebar width on desktop */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <BottomNav />
    </div>
  );
}
