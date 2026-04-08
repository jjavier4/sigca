import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo COMITE y ADMIN pueden acceder
    if (session.user.rol !== 'COMITE' && session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      );
    }

    const anioActual = new Date().getFullYear();

    // Obtener TODOS los trabajos del año actual
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
            titulo: true,
            fecha_inicio: true,
            fecha_cierre: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear trabajos
    const trabajosFormateados = trabajos.map(trabajo => ({
      id: trabajo.id,
      titulo: trabajo.titulo,
      tipo: trabajo.tipo,
      archivo_url: trabajo.archivo_url,
      nvl_ia: trabajo.nvl_ia,
      nvl_plagio: trabajo.nvl_plagio,
      autor: `${trabajo.usuario.nombre} ${trabajo.usuario.apellidoP} ${trabajo.usuario.apellidoM}`,
      autorEmail: trabajo.usuario.email,
      convocatoria: {
        id: trabajo.convocatoria.id,
        titulo: trabajo.convocatoria.titulo,
        fecha_inicio: trabajo.convocatoria.fecha_inicio,
        fecha_cierre: trabajo.convocatoria.fecha_cierre
      },
      createdAt: trabajo.createdAt
    }));

    // Separar en dos listas
    const trabajosPendientes = trabajosFormateados.filter(
      trabajo => trabajo.nvl_ia === null || trabajo.nvl_plagio === null
    );

    const trabajosEvaluados = trabajosFormateados.filter(
      trabajo => trabajo.nvl_ia !== null && trabajo.nvl_plagio !== null
    );

    return NextResponse.json({
      total: trabajosFormateados.length,
      pendientes: {
        total: trabajosPendientes.length,
        trabajos: trabajosPendientes
      },
      evaluados: {
        total: trabajosEvaluados.length,
        trabajos: trabajosEvaluados
      }
    });

  } catch (error) {
    console.error('Error al obtener trabajos para análisis:', error);
    return NextResponse.json(
      { error: 'Error al obtener trabajos' },
      { status: 500 }
    );
  }
}