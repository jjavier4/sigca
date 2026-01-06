import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generarDictamenPDF } from '@/lib/pdfGenerator';
import { sendEmail, emailTrabajoAceptado } from '@/lib/email';

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        if (session.user.rol !== 'COMITE' && session.user.rol !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No tienes permisos para realizar esta acción' },
                { status: 403 }
            );
        }

        const { trabajoId, presencial } = await request.json();

        // Obtener el trabajo con todas sus relaciones
        const trabajo = await prisma.trabajos.findUnique({
            where: { id: trabajoId },
            include: {
                usuario: true,
                convocatoria: true,
                asignaciones: {
                    where: { activa: false }
                }
            }
        });

        if (!trabajo) {
            return NextResponse.json(
                { error: 'Trabajo no encontrado' },
                { status: 404 }
            );
        }

        // Validación 1: Debe existir nivel de plagio e IA
        if (trabajo.nvl_ia === null || trabajo.nvl_plagio === null) {
            return NextResponse.json(
                { error: 'El trabajo debe tener niveles de IA y plagio registrados' },
                { status: 400 }
            );
        }

        // Validación 2: Todas las asignaciones deben estar calificadas
        const asignacionesSinCalificar = trabajo.asignaciones.filter(
            asig => asig.calificacion === null
        );

        if (asignacionesSinCalificar.length > 0) {
            return NextResponse.json(
                { error: 'Todas las asignaciones deben estar calificadas antes de aceptar el trabajo' },
                { status: 400 }
            );
        }

        // Calcular promedio de calificaciones
        const calificaciones = trabajo.asignaciones.map(asig => asig.calificacion);
        const promedio = calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length;
        const promedioFinal = parseFloat(promedio.toFixed(2));

        // Actualizar trabajo
        await prisma.trabajos.update({
            where: { id: trabajoId },
            data: {
                estado: 'ACEPTADO',
                calificacion_final: promedioFinal,
                presencial: presencial
            }
        });

        // Preparar datos para el PDF
        const nombreCompleto = `${trabajo.usuario.nombre} ${trabajo.usuario.apellidoP} ${trabajo.usuario.apellidoM}`;
        const autores = trabajo.coautores.length > 0
            ? trabajo.coautores.join(', ')
            : 'Sin coautores';
        const modalidad = presencial ? 'Presencial' : 'Virtual';
        const fecha = new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const anio = new Date().getFullYear();
        const comentarios = trabajo.asignaciones.map((asignacion, index) => ({
            numero: index + 1,
            texto: asignacion.comentario || 'Sin comentarios'
        }));

        const datosPDF = {
            nombreCompleto,
            titulo: trabajo.titulo,
            autores,
            modalidad,
            calificacion: promedioFinal,
            fecha,
            anio,
            comentarios // Array de objetos con número y texto
        };

        // Generar PDF
        const pdfBuffer = await generarDictamenPDF('ACEPTADO', datosPDF);

        // Preparar contenido del email usando la plantilla existente
        const { html, text } = emailTrabajoAceptado({
            nombreCompleto,
            titulo: trabajo.titulo,
            modalidad,
            calificacion: promedioFinal,
            anio
        });

        // Enviar correo usando tu función sendEmail existente
        const emailResult = await sendEmail({
            to: trabajo.usuario.email,
            subject: `CIIDiCI ${anio} - Trabajo Aceptado: ${trabajo.titulo}`,
            html,
            text,
            attachments: [
                {
                    filename: `Dictamen_Aceptacion_${trabajoId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        if (!emailResult.success) {
            console.error('Error al enviar email:', emailResult.error);
            // No fallar la operación si el email falla, pero registrar el error
        }

        return NextResponse.json({
            message: 'Trabajo aceptado exitosamente',
            trabajo: {
                id: trabajo.id,
                titulo: trabajo.titulo,
                estado: 'ACEPTADO',
                calificacion_final: promedioFinal,
                presencial
            },
            emailSent: emailResult.success
        });

    } catch (error) {
        console.error('Error al aceptar trabajo:', error);
        return NextResponse.json(
            { error: 'Error al aceptar trabajo' },
            { status: 500 }
        );
    }
}