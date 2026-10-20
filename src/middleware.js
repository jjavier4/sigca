import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/ciidici", request.url));
  }
  // Rutas protegidas
  const protectedRoutes = [
    '/admin',
    '/author',
    '/committee',
    '/reviewer'
  ];

  const rutas_publicas = [
    /^\/login\/?$/,
    /^\/register-revisor\/?$/,
    /^\/restablecer\/[^/]+\/?$/,
  ];

  // Verificar si es ruta protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Verificar si es ruta pública
  const isPublicRoute = rutas_publicas.some(pattern => pattern.test(pathname));

  if (!isProtectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }
  // Obtener token de sesión
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  // Si no hay token, redirigir a login
  if (!token) {
    // nextUrl.clone() conserva el basePath (/ciidici); new URL('/login', ...) lo perdería
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
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
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.search = '';
      return NextResponse.redirect(url);
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