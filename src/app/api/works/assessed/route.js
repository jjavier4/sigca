import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    /** 
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo COMITE y ADMIN pueden ver esta vista
    if (session.user.rol !== 'COMITE' && session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      );
    }
*/
    const anioActual = new Date().getFullYear();

    // Obtener trabajos del año actual con sus asignaciones
    const trabajos = await prisma.trabajos.findMany({
      where: {
        id: {
          startsWith: `${anioActual}-`
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidoP: true,
            apellidoM: true,
            email: true
          }
        },
        convocatoria: {
          select: {
            id: true,
            titulo: true
          }
        },
        asignaciones: {
          include: {
            revisor: {
              select: {
                id: true,
                nombre: true,
                apellidoP: true,
                apellidoM: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear datos para la tabla
    const trabajosFormateados = trabajos.map(trabajo => {
      // Extraer calificaciones de las asignaciones
      const calificaciones = trabajo.asignaciones.map(asignacion => ({
        revisorId: asignacion.revisor.id,
        revisorNombre: `${asignacion.revisor.nombre} ${asignacion.revisor.apellidoP}`,
        calificacion: asignacion.calificacion,
        comentario: asignacion.comentario,
        activa: asignacion.activa,
        closeAt: asignacion.closeAt
      }));

      // Calcular estadísticas de calificaciones
      const calificacionesNumeros = calificaciones
        .filter(c => c.calificacion !== null)
        .map(c => c.calificacion);



      const totalAsignaciones = trabajo.asignaciones.length;
      const asignacionesCalificadas = calificacionesNumeros.length;

      const promedioCalificacion = calificacionesNumeros.length > 0 &&
        asignacionesCalificadas === totalAsignaciones
        ? calificacionesNumeros.reduce((sum, cal) => sum + cal, 0) / calificacionesNumeros.length
        : null;

      return {
        id: trabajo.id,
        titulo: trabajo.titulo,
        tipo: trabajo.tipo,
        estado: trabajo.estado,
        nvl_ia: trabajo.nvl_ia,
        nvl_plagio: trabajo.nvl_plagio,
        presencial: trabajo.presencial,
        autor: `${trabajo.usuario.nombre} ${trabajo.usuario.apellidoP} ${trabajo.usuario.apellidoM}`,
        autorEmail: trabajo.usuario.email,
        convocatoria: trabajo.convocatoria.titulo,
        calificaciones,
        totalAsignaciones,
        asignacionesCalificadas,
        promedioCalificacion: promedioCalificacion ? parseFloat(promedioCalificacion.toFixed(2)) : null,
        calificacionFinal: trabajo.calificacion_final,
        createdAt: trabajo.createdAt
      };
    });
    console.log(trabajosFormateados);
    return NextResponse.json({
      anio: anioActual,
      total: trabajosFormateados.length,
      trabajos: trabajosFormateados
    });

  } catch (error) {
    console.error('Error al obtener trabajos calificados:', error);
    return NextResponse.json(
      { error: 'Error al obtener trabajos calificados' },
      { status: 500 }
    );
  }
}