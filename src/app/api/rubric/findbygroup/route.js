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

        // Obtener el parámetro 'tipo' de la URL
        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get('tipo');

        // Validar que el tipo sea válido
        if (!tipo || !['DIFUSION', 'DIVULGACION'].includes(tipo.toUpperCase())) {
            return NextResponse.json(
                { error: 'Tipo inválido. Debe ser DIFUSION o DIVULGACION' },
                { status: 400 }
            );
        }

        const criterios = await prisma.criteriosEvaluacion.findMany({
            where: {
                grupo: tipo.toUpperCase()
            },
            orderBy: {
                createdAt: 'asc'
            },
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                grupo: true,
                descripcion_puntaje: true
            }
        });



        if (criterios.length === 0) {
            return NextResponse.json(
                {
                    error: `No hay criterios de evaluación configurados para ${tipo}. Contacte al administrador.`,
                    criterios: []
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            grupo: tipo.toUpperCase(),
            total: criterios.length,
            criterios
        });

    } catch (error) {
        console.error('Error al obtener criterios por grupo:', error);
        return NextResponse.json(
            { error: 'Error al obtener criterios de evaluación' },
            { status: 500 }
        );
    }
}