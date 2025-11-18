import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const trabajoId = searchParams.get('trabajoId');

        if (!trabajoId) {
            return NextResponse.json(
                { error: 'ID de trabajo requerido' },
                { status: 400 }
            );
        }

        // Verificar que el trabajo existe
        const trabajo = await prisma.trabajos.findUnique({
            where: { id: trabajoId },
            select: {
                usuarioId: true
            }
        });

        if (!trabajo) {
            return NextResponse.json(
                { error: 'Trabajo no encontrado' },
                { status: 404 }
            );
        }

        // Solo el autor o admin/comité pueden ver comentarios
        const esAutor = trabajo.usuarioId === session.user.id;
        const esAdminOComite = ['ADMIN', 'COMITE'].includes(session.user.rol);

        if (!esAutor && !esAdminOComite) {
            return NextResponse.json(
                { error: 'No tienes permiso para ver estos comentarios' },
                { status: 403 }
            );
        }

        // Obtener comentarios anónimos
        const comentarios = await prisma.comentarios.findMany({
            where: {
                trabajoId: trabajoId
            },
            select: {
                id: true,
                contenido: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(
            { 
                comentarios,
                total: comentarios.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        return NextResponse.json(
            { error: 'Error al obtener los comentarios' },
            { status: 500 }
        );
    }
}