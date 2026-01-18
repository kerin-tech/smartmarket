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
          600: '#2563EB', // Color principal para botones según Colores.docx
          700: '#1D4ED8',
        },
        error: {
          main: '#EF4444', // Según tus requerimientos de validación
        }
      },
      boxShadow: {
        'primary': '0 4px 14px rgba(37, 99, 235, 0.25)', // Según Elevación.docx
      },
      borderRadius: {
        'xl': '12px', // Según Espaciado/Elevación
      }
    },
  },
  plugins: [],
};
export default config;