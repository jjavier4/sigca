import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Este middleware protege las rutas especificadas
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protección por rol
    if (path.startsWith('/admin') && token?.rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (path.startsWith('/comite') && token?.rol !== 'COMITE' && token?.rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (path.startsWith('/revisor') && token?.rol !== 'REVISOR' && token?.rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Solo ejecuta el middleware si el usuario está autenticado
      authorized: ({ token }) => !!token,
    },
  }
);

// Rutas que serán protegidas por el middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/comite/:path*',
    '/revisor/:path*',
    '/trabajos/:path*',
    '/perfil/:path*',
  ],
};