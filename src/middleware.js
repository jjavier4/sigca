import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  // Rutas protegidas
  const protectedRoutes = [
    '/admin',
    '/author',
    '/committee',
    '/reviewer'
  ];

  // Verificar si es ruta protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  // Obtener token de sesión
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  // Si no hay token, redirigir a login
  if (!token) {
    const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth`, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  // Verificar permisos por rol
  const rolePermissions = {
    '/admin': ['ADMIN'],
    '/author': ['AUTOR', 'ADMIN'],
    '/committee': ['COMITE', 'ADMIN'],
    '/reviewer': ['REVISOR', 'ADMIN']
  };

  // Encontrar la ruta base que coincide
  const baseRoute = protectedRoutes.find(route => pathname.startsWith(route));

  if (baseRoute) {
    const allowedRoles = rolePermissions[baseRoute];
    const userRole = token.rol;


    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(
        new URL('/unauthorized', request.url)
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/author/:path*',
    '/committee/:path*',
    '/reviewer/:path*'
  ]
};