'use client';

import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  variant?: 'default' | 'primary';
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  href,
  variant = 'default',
  subtitle,
}: MetricCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-xl p-5 transition-all duration-300 h-full flex flex-col justify-between',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
          : 'bg-card border border-border',
        href && 'hover:shadow-md hover:border-primary/30 cursor-pointer group'
      )}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'p-2.5 rounded-lg transition-colors',
              variant === 'primary'
                ? 'bg-white/20'
                : 'bg-primary-100' // Tu color original
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                variant === 'primary' ? 'text-white' : 'text-primary-600' // Tu color original
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className={cn(
              'text-2xl font-bold tracking-tight',
              variant === 'primary' ? 'text-white' : 'text-foreground'
            )}
          >
            {value}
          </p>
          <p className={cn(
              'text-sm font-medium',
              variant === 'primary' ? 'text-white/90' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          {subtitle && (
            <p className={cn(
                'text-xs opacity-70',
                variant === 'primary' ? 'text-white' : 'text-muted-foreground'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* CTA Dinámico con Truncado (Gestionar Pro...) */}
      {href && (
        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-2 overflow-hidden">
          <span 
            className={cn(
              "text-sm font-medium truncate", // Truncado aplicado aquí
              variant === 'primary' ? 'text-white' : 'text-primary-600'
            )}
          >
            Gestionar {title.toLowerCase()}
          </span>
          <ChevronRight 
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1",
              variant === 'primary' ? 'text-white' : 'text-primary-600'
            )} 
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}