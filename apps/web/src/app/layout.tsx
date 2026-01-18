import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Importamos Inter como dice Tipografía.docx
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartMarket - Ahorra en tus compras",
  description: "La mejor forma de comparar precios y ahorrar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}