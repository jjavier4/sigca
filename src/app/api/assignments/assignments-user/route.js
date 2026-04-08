import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession();
        const anioActual = new Date().getFullYear();
        const { searchParams } = new URL(request.url);
        const revisorId = searchParams.get('revisorId');

        if (!revisorId) {
            return NextResponse.json(
                { error: 'ID de revisor requerido' },
                { status: 400 }
            );
        }


        const asignaciones = await prisma.asignaciones.findMany({
            where: {
                revisorId: revisorId,
                id: {
                    startsWith: `${anioActual}-`
                }
            },
            include: {
                trabajo: {
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
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('Asignaciones encontradas:', asignaciones);
        return NextResponse.json(
            {
                asignaciones,
                total: asignaciones.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al obtener asignaciones:', error);
        return NextResponse.json(
            { error: 'Error al obtener las asignaciones' },
            { status: 500 }
        );
    }
}