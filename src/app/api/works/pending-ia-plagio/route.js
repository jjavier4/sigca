import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/db';


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

    // Obtener trabajos donde AMBOS campos sean null
    const trabajos = await prisma.trabajos.findMany({
      where: {
        OR: [
          { nvl_ia: null },
          { nvl_plagio: null }
        ]
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

    return NextResponse.json({
      total: trabajosFormateados.length,
      trabajos: trabajosFormateados
    });

  } catch (error) {
    console.error('Error al obtener trabajos pendientes de análisis:', error);
    return NextResponse.json(
      { error: 'Error al obtener trabajos pendientes' },
      { status: 500 }
    );
  }
}