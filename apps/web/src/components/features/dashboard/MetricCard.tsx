// src/components/features/dashboard/MetricCard.tsx

'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
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
        'rounded-xl p-4 transition-all',
        variant === 'primary'
          ? 'bg-primary-500 text-white'
          : 'bg-card border border-color',
        href && 'hover:shadow-md cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={cn(
            'p-2 rounded-lg',
            variant === 'primary'
              ? 'bg-primary-400/30'
              : 'bg-muted'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              variant === 'primary' ? 'text-white' : 'text-muted-foreground'
            )}
          />
        </div>
      </div>
      <p
        className={cn(
          'text-2xl font-bold mb-1',
          variant === 'primary' ? 'text-white' : 'text-foreground'
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'text-sm',
          variant === 'primary' ? 'text-primary-100' : 'text-muted-foreground'
        )}
      >
        {title}
      </p>
      {subtitle && (
        <p
          className={cn(
            'text-xs mt-1',
            variant === 'primary' ? 'text-primary-200' : 'text-muted-foreground'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}