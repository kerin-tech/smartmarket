import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ===========================================
      // COLORES - Design System SmartMarket
      // ===========================================
      colors: {
        // Primary - Azul (Acciones principales, CTAs)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Color principal
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // Secondary - Gris (Textos, fondos, bordes)
        secondary: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        // Success - Verde (Confirmaciones, éxito)
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E', // Color principal
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Warning - Amarillo (Alertas, advertencias)
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Color principal
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Error - Rojo (Errores, destructivos)
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444', // Color principal
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Info - Cyan (Información, tips)
        info: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4', // Color principal
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        // ===========================================
        // COLORES DE CATEGORÍAS DE PRODUCTOS
        // ===========================================
        category: {
          // 🍎 Frutas - Naranja
          fruits: {
            light: '#FFF7ED',
            DEFAULT: '#F97316',
            dark: '#C2410C',
          },
          // 🥬 Verduras - Verde
          vegetables: {
            light: '#F0FDF4',
            DEFAULT: '#22C55E',
            dark: '#15803D',
          },
          // 🍚 Granos - Amarillo
          grains: {
            light: '#FEFCE8',
            DEFAULT: '#EAB308',
            dark: '#A16207',
          },
          // 🥛 Lácteos - Celeste
          dairy: {
            light: '#F0F9FF',
            DEFAULT: '#0EA5E9',
            dark: '#0369A1',
          },
          // 🥩 Carnes - Rojo
          meats: {
            light: '#FEF2F2',
            DEFAULT: '#EF4444',
            dark: '#B91C1C',
          },
          // 🥤 Bebidas - Violeta
          beverages: {
            light: '#F5F3FF',
            DEFAULT: '#8B5CF6',
            dark: '#6D28D9',
          },
          // 🧹 Limpieza - Cyan
          cleaning: {
            light: '#ECFEFF',
            DEFAULT: '#06B6D4',
            dark: '#0E7490',
          },
          // 📦 Otros - Gris
          other: {
            light: '#F9FAFB',
            DEFAULT: '#6B7280',
            dark: '#374151',
          },
        },
      },
      // ===========================================
      // TIPOGRAFÍA
      // ===========================================
      fontFamily: {
        sans: [ 'var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],      // 48px
        'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],   // 36px
        'display-sm': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],  // 30px
        'heading-lg': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],    // 24px
        'heading-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],   // 20px
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],  // 18px
        'body-lg': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],         // 16px
        'body-md': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],     // 14px
        'body-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],      // 12px
        'label': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],       // 14px medium
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],      // 12px
      },
      // ===========================================
      // ESPACIADO (Sistema de 4px)
      // ===========================================
      spacing: {
        '4.5': '1.125rem',  // 18px
        '13': '3.25rem',    // 52px
        '15': '3.75rem',    // 60px
        '18': '4.5rem',     // 72px
        '22': '5.5rem',     // 88px
      },
      // ===========================================
      // BORDER RADIUS
      // ===========================================
      borderRadius: {
        '4xl': '2rem',      // 32px
        '5xl': '2.5rem',    // 40px
      },
      // ===========================================
      // SOMBRAS
      // ===========================================
      boxShadow: {
        'soft-xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'soft-sm': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'soft-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'soft-xl': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        'soft-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.1)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      // ===========================================
      // ANIMACIONES
      // ===========================================
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      // ===========================================
      // BREAKPOINTS (Responsive)
      // ===========================================
      screens: {
        'xs': '475px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        // 2xl: 1536px (default)
      },
    },
  },
  plugins: [],
};

export default config;
