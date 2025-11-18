import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado. Debes iniciar sesión' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'ID de usuario requerido' },
                { status: 400 }
            );
        }

        const trabajos = await prisma.trabajos.findMany({
            where: {
                usuarioId: userId
            },
            include: {
                convocatoria: {
                    select: {
                        id: true,
                        titulo: true,
                        descripcion: true,
                        fecha_inicio: true,
                        fecha_cierre: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(
            { 
                trabajos,
                total: trabajos.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al obtener trabajos:', error);
        return NextResponse.json(
            { error: 'Error al obtener los trabajos' },
            { status: 500 }
        );
    }
}