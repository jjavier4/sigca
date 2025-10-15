import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SIGCA - Sistema de Gestión de Conferencias Académicas',
  description: 'Congreso Internacional de la Investigación y Divulgación de la Ciencia y la Ingeniería',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <main className="flex-grow">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}