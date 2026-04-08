import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const anioActual = new Date().getFullYear();
    // Obtener trabajos que tengan al menos una asignación
    const trabajos = await prisma.trabajos.findMany({
      where: {
        asignaciones: {
          some: {} // Tiene al menos una asignación
        },
        id: {
          startsWith: `${anioActual}-`
        }
      },
      include: {
        convocatoria: {
          select: {
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
                apellidoM: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      trabajos,
      total: trabajos.length
    });

  } catch (error) {
    console.error('Error al obtener trabajos con asignaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener los trabajos' },
      { status: 500 }
    );
  }
}