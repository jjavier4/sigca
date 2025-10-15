'use client';

import { Home, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:bg-blue-900 px-4 py-2 rounded-lg transition-all duration-300">
          <Home size={24} />
          <span className="font-semibold text-lg hidden sm:inline">SIGCA</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link href="/auth" className="flex items-center space-x-2 bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
            <LogIn size={20} />
            <span>Iniciar Sesión</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}