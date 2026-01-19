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
    container: 'w-8 h-8',
    icon: 'h-4 w-4',
    text: 'text-lg',
  },
  md: {
    container: 'w-10 h-10',
    icon: 'h-5 w-5',
    text: 'text-xl',
  },
  lg: {
    container: 'w-12 h-12',
    icon: 'h-6 w-6',
    text: 'text-2xl',
  },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeConfig = sizes[size];

  return (
    <Link
      href={routes.home}
      className={cn('flex items-center gap-2.5 focus:outline-none', className)}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md',
          sizeConfig.container
        )}
      >
        <ShoppingCart className={cn('text-white', sizeConfig.icon)} />
      </div>
      {showText && (
        <span className={cn('font-bold text-secondary-900', sizeConfig.text)}>
          SmartMarket
        </span>
      )}
    </Link>
  );
}
