import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas de página protegidas, con los roles que pueden entrar a cada una
const rolePermissions = {
  '/admin': ['ADMIN'],
  '/author': ['AUTOR', 'ADMIN'],
  '/committee': ['COMITE', 'ADMIN'],
  '/reviewer': ['REVISOR', 'ADMIN']
};
const protectedRoutes = Object.keys(rolePermissions);

// Endpoints de /api que se pueden usar sin sesión. Todo lo demás exige estar autenticado.
const rutasApiPublicas = [
  /^\/api\/auth(\/|$)/,                  // next-auth, verificación, reset de contraseña, invitaciones
  /^\/api\/convocatories\/findall2\/?$/, // lista pública de convocatorias
  /^\/api\/user\/register\/?$/,          // registro (el rol lo restringe la propia ruta)
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Obtener token de sesión
  const getSessionToken = () => getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // API: segunda barrera. Cada ruta sigue comprobando su rol y la propiedad de los datos
  // con authorize(); esto solo evita que una ruta nueva quede abierta por olvido.
  if (pathname.startsWith('/api/')) {
    if (rutasApiPublicas.some(patron => patron.test(pathname))) {
      return NextResponse.next();
    }
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Páginas protegidas
  const baseRoute = protectedRoutes.find(route => pathname.startsWith(route));
  if (!baseRoute) {
    return NextResponse.next();
  }

  const token = await getSessionToken();
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
  if (!rolePermissions[baseRoute].includes(token.rol)) {
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/author/:path*',
    '/committee/:path*',
    '/reviewer/:path*'
  ]
};
