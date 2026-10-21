import 'server-only';
import { prisma } from '@/lib/db';

export async function getTrabajosDeAutor(usuarioId) {
  const trabajos = await prisma.trabajos.findMany({
    where: {
      usuarioId,
      convocatoria: { activa: true },
    },
    select: {
      id: true,
      titulo: true,
      tipo: true,
      estado: true,
      createdAt: true,
      updatedAt: true,
      referencia_pago: true,
      convocatoria: { select: { id: true, titulo: true, descripcion: true } },
      coautores: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return trabajos.map((trabajo) => {
    const referenciaGenerada = Boolean(trabajo.referencia_pago);
    return {
      ...trabajo,
      referencia_pago: referenciaGenerada,
      estado_pago: trabajo.estado === 'ACEPTADO' ? referenciaGenerada : null,
    };
  });
}
