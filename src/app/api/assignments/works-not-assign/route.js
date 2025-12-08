import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession();
        
        

        // Obtener todos los trabajos en revisión con sus asignaciones
        const trabajosEnRevision = await prisma.trabajos.findMany({
            where: {
                estado: 'EN_REVISION'
            },
            include: {
                usuario: {
                    select: {
                        nombre: true,
                        apellidoP: true,
                        apellidoM: true,
                        email: true
                    }
                },
                convocatoria: {
                    select: {
                        titulo: true,
                        descripcion: true
                    }
                },
                asignaciones: {
                    where: {
                        activa: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Filtrar solo los que NO tienen asignaciones activas
        const trabajosSinAsignar = trabajosEnRevision.filter(
            trabajo => trabajo.asignaciones.length === 0
        );

        return NextResponse.json(
            { 
                trabajos: trabajosSinAsignar,
                total: trabajosSinAsignar.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al obtener trabajos sin asignar:', error);
        return NextResponse.json(
            { error: 'Error al obtener los trabajos' },
            { status: 500 }
        );
    }
}