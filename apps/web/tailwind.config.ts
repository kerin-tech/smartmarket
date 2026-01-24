// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- VARIABLES SEMÁNTICAS DIRECTAS ---
        // Esto corrige el problema de que salgan transparentes
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
          // Escala numérica
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        
        // Mapeo correcto para el botón secundario
        secondaryBtn: {
          DEFAULT: 'var(--secondary-btn)',
          foreground: 'var(--secondary-btn-foreground)',
          hover: 'var(--secondary-btn-hover)',
        },

        // Mapeo de sistema (Shadcn style)
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },

        // --- ESCALAS RESTANTES ---
        secondary: {
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
        },
        success: {
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          // ... (puedes completar los demás si los necesitas)
        },
        danger: {
          500: 'var(--color-danger-500)',
          600: 'var(--color-danger-600)',
        },
        warning: {
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // ... resto de tu config (boxShadow, keyframes, etc)
    },
  },
  plugins: [],
};

export default config;