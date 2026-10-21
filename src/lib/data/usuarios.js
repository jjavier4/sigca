import 'server-only';
import { prisma } from '@/lib/db';

export async function getPerfil(userId) {
  return prisma.usuarios.findUnique({
    where: { id: userId },
    select: { numero_control: true },
  });
}
