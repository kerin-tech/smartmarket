'use client';
import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type, icon: Icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePassword = () => setShowPassword(!showPassword);

    return (
      <div className="flex flex-col gap-1.5 w-full animate-fade-in">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-10 py-3 rounded-xl border transition-all
              ${error ? 'border-error-main ring-1 ring-error-main' : 'border-gray-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100'}
              outline-none placeholder:text-gray-400`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-error-main font-medium flex items-center gap-1">
             {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';