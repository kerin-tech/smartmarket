import { ButtonHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon: Icon, children, ...props }, ref) => {
    const baseStyles = "rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary',
      secondary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
      outline: 'border-2 border-gray-200 text-gray-700 hover:border-primary-600 hover:text-primary-600',
      ghost: 'text-gray-600 hover:bg-gray-100',
      danger: 'bg-error-main text-white hover:bg-error-dark shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm h-[36px]',
      md: 'px-4 py-3 text-base h-[44px]',
      lg: 'px-6 py-4 text-lg h-[52px]',
    };

    return (
      <button ref={ref} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`} {...props}>
        {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
        {!isLoading && Icon && <Icon size={20} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
