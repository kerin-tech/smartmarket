// src/components/ui/ButtonGroup.tsx
import { cn } from '@/lib/utils';

export function ButtonGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "inline-flex -space-x-px shadow-sm", // El -space-x-px hace que los bordes compartidos no se vean dobles
      "[&>button:first-child]:rounded-r-none [&>button:last-child]:rounded-l-none",
      "[&>button:not(:first-child):not(:last-child)]:rounded-none",
      className
    )}>
      {children}
    </div>
  );
}