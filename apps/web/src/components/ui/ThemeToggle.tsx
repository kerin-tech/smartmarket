// src/components/ui/ThemeToggle.tsx

'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'buttons';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useThemeContext();

  // Prevenir hydration mismatch
  if (!mounted) {
    return (
      <div className={cn('w-10 h-10 rounded-lg bg-muted animate-pulse', className)} />
    );
  }

  // Variante simple: solo ícono toggle
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'p-2.5 rounded-lg transition-colors',
          'bg-muted hover:bg-secondary-200',
          'dark:bg-secondary-200 dark:hover:bg-secondary-300',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'dark:focus:ring-offset-secondary-50',
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    );
  }

  // Variante con 3 botones: Light, Dark, System
  if (variant === 'buttons') {
    const options: { value: Theme; icon: typeof Sun; label: string }[] = [
      { value: 'light', icon: Sun, label: 'Claro' },
      { value: 'dark', icon: Moon, label: 'Oscuro' },
      { value: 'system', icon: Monitor, label: 'Sistema' },
    ];

    return (
      <div className={cn('flex gap-1 p-1 bg-muted dark:bg-secondary-200 rounded-lg', className)}>
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                isActive
                  ? 'bg-card dark:bg-muted text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground'
              )}
              aria-label={option.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variante dropdown
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'bg-muted hover:bg-secondary-200',
          'dark:bg-secondary-200 dark:hover:bg-secondary-300',
          'text-foreground dark:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
      >
        {resolvedTheme === 'dark' ? (
          <>
            <Moon className="h-4 w-4" />
            <span className="text-sm">Oscuro</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4" />
            <span className="text-sm">Claro</span>
          </>
        )}
      </button>
    </div>
  );
}