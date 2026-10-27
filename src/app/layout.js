import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import './globals.css';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SessionProvider from '@/components/providers/sessionProvider';
import { basePath } from '@/utils/basePath.mjs';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SIGCA - Sistema de Gestión de Conferencias Académicas',
  description: 'Congreso Internacional de la Investigación y Divulgación de la Ciencia y la Ingeniería',
  icons: {
    icon: `${basePath}/icon.png`,
    shortcut: `${basePath}/icon.png`,
    apple: `${basePath}/icon.png`,
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const usuario = session?.user
    ? { name: session.user.name, rol: session.user.rol }
    : null;

  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <main className="flex-grow">
          <SessionProvider session={session} basePath={`${basePath}/api/auth`}>
            <Header usuario={usuario} />
            {children}
            <Footer />
          </SessionProvider>

        </main>
      </body>
    </html>
  );
}