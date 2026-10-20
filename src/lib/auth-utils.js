import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

// Obtener la sesión del usuario actual en Server Components
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null
}

// Verificar si el usuario tiene un rol específico
export async function checkUserRole(allowedRoles) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.rol);
}

/**
 * Autorización para route handlers (y futuras Server Actions).
 * Uso:
 *   const { session, error } = await authorize(['COMITE', 'ADMIN']);
 *   if (error) return error;
 * Sin `roles` solo exige sesión iniciada.
 */
export async function authorize(roles) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    };
  }

  if (roles && !roles.includes(session.user.rol)) {
    return {
      error: NextResponse.json({ error: 'No autorizado' }, { status: 403 }),
    };
  }

  return { session };
}
