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

  // Prevenir hydration mismatch con un skeleton semántico
  if (!mounted) {
    return (
      <div className={cn('w-10 h-10 rounded-lg bg-muted/50 animate-pulse', className)} />
    );
  }

  // Variante simple: solo ícono toggle
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'p-2.5 rounded-lg transition-all active:scale-95',
          'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground',
          'border border-border/40',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-5 w-5 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="h-5 w-5 transition-transform duration-300 rotate-0 scale-100" />
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
      <div className={cn('flex gap-1 p-1 bg-muted rounded-xl border border-border', className)}>
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-card text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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

  // Variante dropdown / label
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border border-border',
          'bg-muted hover:bg-accent text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary'
        )}
      >
        {resolvedTheme === 'dark' ? (
          <>
            <Moon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Oscuro</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Claro</span>
          </>
        )}
      </button>
    </div>
  );
}