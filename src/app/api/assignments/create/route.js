import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(request) {
    try {
        const session = await getServerSession();
        
        /*
        if (session.user.rol !== 'COMITE') {
            return NextResponse.json(
                { error: 'No autorizado. Solo  comité pueden acceder' },
                { status: 403 }
            );
        }
* */
        const body = await request.json();
        const { trabajoId, revisorId } = body;

        // Validaciones
        if (!trabajoId || !revisorId) {
            return NextResponse.json(
                { error: 'ID de trabajo y revisor son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el trabajo existe y está en estado EN_REVISION
        const trabajo = await prisma.trabajos.findUnique({
            where: { id: trabajoId },
            include: {
                asignaciones: {
                    where: {
                        activa: true
                    }
                }
            }
        });

        if (!trabajo) {
            return NextResponse.json(
                { error: 'El trabajo no existe' },
                { status: 404 }
            );
        }

        if (trabajo.estado !== 'EN_REVISION') {
            return NextResponse.json(
                { error: 'Solo se pueden asignar trabajos en estado EN_REVISION' },
                { status: 400 }
            );
        }

        // Verificar que no tenga asignaciones activas
        if (trabajo.asignaciones.length > 0) {
            return NextResponse.json(
                { error: 'Este trabajo ya tiene un revisor asignado' },
                { status: 400 }
            );
        }

        // Verificar que el revisor existe y tiene rol REVISOR
        const revisor = await prisma.usuarios.findUnique({
            where: { id: revisorId }
        });

        if (!revisor) {
            return NextResponse.json(
                { error: 'El revisor no existe' },
                { status: 404 }
            );
        }

        if (revisor.rol !== 'REVISOR') {
            return NextResponse.json(
                { error: 'El usuario seleccionado no tiene rol de revisor' },
                { status: 400 }
            );
        }

        // Verificar que no exista ya una asignación de este trabajo a este revisor
        const asignacionExistente = await prisma.asignaciones.findUnique({
            where: {
                trabajoId_revisorId: {
                    trabajoId: trabajoId,
                    revisorId: revisorId
                }
            }
        });

        if (asignacionExistente) {
            return NextResponse.json(
                { error: 'Ya existe una asignación de este trabajo a este revisor' },
                { status: 400 }
            );
        }

        // Calcular fecha de cierre (10 días desde hoy)
        const now = new Date();
        const closeAt = new Date(now);
        closeAt.setDate(closeAt.getDate() + 10);

        // Crear la asignación
        const asignacion = await prisma.asignaciones.create({
            data: {
                trabajoId: trabajoId,
                revisorId: revisorId,
                activa: true,
                closeAt: closeAt
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
                                titulo: true
                            }
                        }
                    }
                },
                revisor: {
                    select: {
                        nombre: true,
                        apellidoP: true,
                        apellidoM: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(
            { 
                message: 'Asignación creada exitosamente',
                asignacion: asignacion,
                fechaCierre: closeAt.toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error al crear asignación:', error);
        return NextResponse.json(
            { error: 'Error al crear la asignación' },
            { status: 500 }
        );
    }
}