import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
    <div className="bg-gray-50 p-6 rounded-3xl mb-4 text-gray-400">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-xs mb-8">{description}</p>
    {action}
  </div>
);
