'use client';
import { ChevronLeft, User, Menu, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
      {/* Logo Izquierda */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">SM</div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">SmartMarket</span>
      </div>

      {/* Perfil Derecha */}
      <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
          C
        </div>
        <span className="hidden lg:block font-semibold text-gray-700">Carolina</span>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </header>
  );
};
