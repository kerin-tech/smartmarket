import type { Metadata } from 'next';
// 1. Importamos la fuente desde el módulo de Google de Next.js
import { DM_Sans } from 'next/font/google';
import './globals.css';

// 2. Configuramos la fuente
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  // Definimos la variable CSS que usará Tailwind
  variable: '--font-dm-sans', 
});

export const metadata: Metadata = {
  title: {
    default: 'SmartMarket - Compara precios y ahorra',
    template: '%s | SmartMarket',
  },
  description:
    'Gestiona tus compras del hogar, compara precios entre supermercados y ahorra dinero cada mes con SmartMarket.',
  keywords: [
    'comparar precios',
    'supermercado',
    'ahorro',
    'compras',
    'mercado',
    'Colombia',
    'canasta familiar',
  ],
  authors: [{ name: 'SmartMarket' }],
  creator: 'SmartMarket',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'SmartMarket',
    title: 'SmartMarket - Compara precios y ahorra',
    description:
      'Gestiona tus compras del hogar, compara precios entre supermercados y ahorra dinero cada mes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartMarket - Compara precios y ahorra',
    description:
      'Gestiona tus compras del hogar, compara precios entre supermercados y ahorra dinero cada mes.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 3. Agregamos la variable de la fuente al tag html
    <html lang="es" className={`${dmSans.variable}`}>
      {/* 4. Aplicamos 'font-sans' al body para que Tailwind use DM Sans */}
      <body className="min-h-screen bg-secondary-50 font-sans antialiased">
        {children}  
      </body>
    </html>
  );  
}
