import { ReactNode } from 'react';

export const Card = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-md p-4 lg:p-6 ${className}`}>
    {children}
  </div>
);
