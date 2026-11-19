'use client';
import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Home, LogIn, LogOut, Menu, X } from 'lucide-react';
import MenuComponent from './menu';
import Link from 'next/link';
import { href } from '@/utils/route';
import { basePath } from '@/utils/basePath.mjs';
export default function Header({ usuario }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <>

      <MenuComponent isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} rol={usuario?.rol} user={usuario?.name} />
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">

          <nav className="flex items-center space-x-4">
            {usuario &&
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 cursor-pointer rounded-lg transition-colors"
                >
                  {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            }
            <Link href="/" className="flex items-center space-x-2 hover:text-blue-900 px-4 py-2 rounded-lg transition-all duration-300">
              <Home size={24} />
              <span className="font-semibold text-lg hidden sm:inline">SIGCA</span>
            </Link>
          </nav>

          <nav className="flex items-center space-x-4">
            {usuario ? (
              // Usuario autenticado
              <>
                <button
                  onClick={() => signOut({ callbackUrl: basePath })}
                  className="group flex items-center space-x-2 bg-white text-blue-900 px-6 py-2.5 rounded-lg font-semibold cursor-pointer"
                >
                  <LogOut size={20} className='transition-transform duration-300 group-hover:-translate-x-2' />
                  <span> Cerrar Sesión</span>
                </button>
              </>
            ) : (
              // Usuario no autenticado
              <>
                <Link href="/login" className="group flex items-center space-x-2 bg-white text-blue-900 px-6 py-2.5 rounded-lg font-semibold">
                  <LogIn size={20} className='transition-transform duration-300 group-hover:translate-x-2 ' />
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