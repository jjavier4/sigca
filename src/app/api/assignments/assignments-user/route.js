import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const { session, error } = await authorize(['REVISOR', 'COMITE', 'ADMIN']);
        if (error) return error;

        const anioActual = new Date().getFullYear();
        const { searchParams } = new URL(request.url);
        // Un revisor solo puede consultar sus propias asignaciones
        const revisorId = session.user.rol === 'REVISOR'
            ? session.user.id
            : searchParams.get('revisorId');

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