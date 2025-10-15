import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { prisma } from './db';

// Obtener la sesión del usuario actual en Server Components
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

// Verificar si el usuario tiene un rol específico
export async function checkUserRole(allowedRoles) {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.rol);
}

// Obtener el usuario completo de la base de datos
export async function getUserFromSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      institucion: true,
      rol: true,
      image: true,
    },
  });

  return usuario;
}