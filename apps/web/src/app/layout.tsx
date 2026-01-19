// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="es">
      <body className="min-h-screen bg-secondary-50 antialiased">
        {children}
      </body>
    </html>
  );
}
