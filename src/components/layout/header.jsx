'use client';
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Home, LogIn, LogOut, Loader, Menu, X, UserPlus, Settings, Users } from 'lucide-react';
import MenuComponent from './menu';
import Link from 'next/link';
import { href } from '@/utils/route';
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <>

      <MenuComponent isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">

          <nav className="flex items-center space-x-4">
            {session &&
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            }
            <Link href="/ciidici" className="flex items-center space-x-2 hover:bg-blue-900 px-4 py-2 rounded-lg transition-all duration-300">
              <Home size={24} />
              <span className="font-semibold text-lg hidden sm:inline">SIGCA</span>
            </Link>
          </nav>

          <nav className="flex items-center space-x-4">
            {loading ? (
              // Mientras carga la sesión
              <div className="w-10 h-10  flex items-center">
                <Loader className="animate-spin text-white mx-auto" />
              </div>
            ) : session ? (
              // Usuario autenticado
              <>

                <span className="text-stone-300">
                  Hola, <span className="font-semibold">{session.user.name}</span>
                </span>
                <Link href={href(session.user.rol)} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  <span>{session.user.rol}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/ciidici' })}
                  className="flex items-center bg-orange-400 text-blue-900 hover:bg-red-400 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg cursor-pointer "
                >
                  <LogOut size={20} />
                  <span> Cerrar Sesión</span>
                </button>
              </>
            ) : (
              // Usuario no autenticado
              <>
                <Link href="/ciidici/auth" className="flex items-center space-x-2 bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  <LogIn size={20} />
                  <span>Iniciar Sesión</span>
                </Link>
              </>
            )}

          </nav>
        </div>
      </header>

    </>
  );
}