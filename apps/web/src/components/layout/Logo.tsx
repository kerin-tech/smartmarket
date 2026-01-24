// src/components/layout/Logo.tsx

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { routes } from '@/config/app.config';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: {
    icon: 'h-6 w-6',
    text: 'text-lg',
  },
  md: {
    icon: 'h-7 w-7',
    text: 'text-xl',
  },
  lg: {
    icon: 'h-9 w-9',
    text: 'text-2xl',
  },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeConfig = sizes[size];

  return (
    <Link
      href={routes.home}
      className={cn(
        'flex items-center gap-2 group focus:outline-none transition-opacity hover:opacity-90', 
        className
      )}
    >
      {/* Icono minimalista sin fondo */}
      <div className="flex items-center justify-center text-primary transition-transform group-hover:scale-105">
        <ShoppingCart className={sizeConfig.icon} strokeWidth={2.5} />
      </div>

      {/* Texto del Logo */}
      {showText && (
        <span className={cn(
          'font-black tracking-tight text-foreground uppercase italic', 
          sizeConfig.text
        )}>
          SMK
          <span className="text-primary not-italic">.</span>
        </span>
      )}
    </Link>
  );
}