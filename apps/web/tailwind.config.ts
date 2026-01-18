import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        error: {
          main: '#EF4444',
          dark: '#DC2626',
        },
        success: {
          main: '#10B981',
          dark: '#059669',
        },
      },
      boxShadow: {
        'bottom-nav': '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
        'primary': '0 4px 14px rgba(37, 99, 235, 0.25)',
      },
      borderRadius: {
        'xl': '12px',
      },
      keyframes: {
      modalScale: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      }
    },
    animation: {
      modalScale: 'modalScale 0.2s ease-out',
      fadeIn: 'fadeIn 0.2s ease-in-out',
    }
    },
  },
  plugins: [],
};
export default config;
