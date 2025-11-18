import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(request) {
    try {
        const session = await getServerSession();
        
     

        const body = await request.json();
        const { trabajoId, asignacionId, nuevoEstado, comentario } = body;

        // Validaciones
        if (!trabajoId || !asignacionId || !nuevoEstado) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        const estadosValidos = ['ACEPTADO', 'CAMBIOS_SOLICITADOS', 'RECHAZADO'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return NextResponse.json(
                { error: 'Estado no válido' },
                { status: 400 }
            );
        }

        if (nuevoEstado === 'CAMBIOS_SOLICITADOS' && !comentario) {
            return NextResponse.json(
                { error: 'Debes agregar comentarios al solicitar cambios' },
                { status: 400 }
            );
        }

        // Verificar que la asignación existe y pertenece al revisor
        const asignacion = await prisma.asignaciones.findUnique({
            where: { id: asignacionId },
            include: {
                trabajo: true
            }
        });

        if (!asignacion) {
            return NextResponse.json(
                { error: 'Asignación no encontrada' },
                { status: 404 }
            );
        }

        if (asignacion.revisorId !== session.user.id) {
            return NextResponse.json(
                { error: 'No tienes permiso para evaluar este trabajo' },
                { status: 403 }
            );
        }

        if (!asignacion.activa) {
            return NextResponse.json(
                { error: 'Esta asignación ya no está activa' },
                { status: 400 }
            );
        }

        // Usar transacción para actualizar trabajo, asignación y crear comentario
        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Actualizar el estado del trabajo
            const trabajoActualizado = await tx.trabajos.update({
                where: { id: trabajoId },
                data: {
                    estado: nuevoEstado,
                    updatedAt: new Date()
                }
            });

            // 2. Si es ACEPTADO o RECHAZADO, desactivar la asignación
            if (nuevoEstado === 'ACEPTADO' || nuevoEstado === 'RECHAZADO') {
                await tx.asignaciones.update({
                    where: { id: asignacionId },
                    data: {
                        activa: false
                    }
                });
            }

            // 3. Si hay comentario, crearlo (anónimo)
            let comentarioCreado = null;
            if (comentario) {
                comentarioCreado = await tx.comentarios.create({
                    data: {
                        contenido: comentario,
                        trabajoId: trabajoId
                    }
                });
            }

            return {
                trabajo: trabajoActualizado,
                comentario: comentarioCreado
            };
        });

        // Determinar mensaje según el estado
        let mensaje = '';
        switch (nuevoEstado) {
            case 'ACEPTADO':
                mensaje = 'Trabajo aceptado exitosamente';
                break;
            case 'CAMBIOS_SOLICITADOS':
                mensaje = 'Cambios solicitados. El autor podrá ver tus comentarios de forma anónima';
                break;
            case 'RECHAZADO':
                mensaje = 'Trabajo rechazado';
                break;
        }

        return NextResponse.json(
            { 
                message: mensaje,
                trabajo: resultado.trabajo,
                comentario: resultado.comentario
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al evaluar trabajo:', error);
        return NextResponse.json(
            { error: 'Error al evaluar el trabajo' },
            { status: 500 }
        );
    }
}