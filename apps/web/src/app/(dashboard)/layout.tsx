// src/app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER ÚNICO Y GLOBAL */}
      <Header />

      <div className="flex flex-1">
        {/* SIDEBAR PARA DESKTOP */}
        <aside className="hidden lg:block w-64 border-r border-gray-200 bg-white sticky top-16 h-[calc(100vh-64px)]">
          <Sidebar />
        </aside>

        {/* CONTENIDO DINÁMICO */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>

      {/* NAV PARA MOBILE */}
      <BottomNav />
    </div>
  );
}