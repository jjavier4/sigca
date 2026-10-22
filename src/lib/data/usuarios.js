import 'server-only';
import { prisma } from '@/lib/db';

export async function getPerfil(userId) {
  return prisma.usuarios.findUnique({
    where: { id: userId },
    select: { numero_control: true },
  });
}

export async function getUsuariosPorRoles(roles) {
  return prisma.usuarios.findMany({
    where: { rol: { in: roles } },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      bloqueada: true,
    },
    orderBy: [{ rol: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function contarUsuariosPorRol() {
  const grupos = await prisma.usuarios.groupBy({
    by: ['rol'],
    _count: { _all: true },
  });

  const conteos = Object.fromEntries(grupos.map((grupo) => [grupo.rol, grupo._count._all]));
  const total = grupos.reduce((suma, grupo) => suma + grupo._count._all, 0);

  return { ...conteos, total };
}
