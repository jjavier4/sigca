import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const anioActual = new Date().getFullYear();
    const revisores = await prisma.usuarios.findMany({
      where: { rol: 'REVISOR' },
      select: {
        id: true,
        nombre: true,
        apellidoP: true,
        apellidoM: true,
        email: true,
        asignacionesComoRevisor: {
          where: {
            activa: true,
            trabajo: {
              id: {
                startsWith: `${anioActual}-`
              }
            }
          },
          select: {
            id: true,
            trabajoId: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Formatear respuesta con estado de disponibilidad
    const revisoresFormateados = revisores.map(revisor => {
      const trabajosActivos = revisor.asignacionesComoRevisor.length;
      const nombreCompleto = `${revisor.nombre} ${revisor.apellidoP} ${revisor.apellidoM}`;

      return {
        id: revisor.id,
        nombre: nombreCompleto,
        email: revisor.email,
        trabajosActivos: trabajosActivos,
        disponible: trabajosActivos < 4,
        estado: trabajosActivos >= 4 ? 'INDISPUESTO' : 'DISPONIBLE'
      };
    });

    return Response.json({
      revisores: revisoresFormateados,
      success: true
    });

  } catch (error) {
    console.error('Error al obtener revisores:', error);
    return Response.json(
      { error: 'Error al obtener revisores' },
      { status: 500 }
    );
  }
}