import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  description?: string;
}

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
