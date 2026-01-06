import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generarDictamenPDF } from '@/lib/pdfGenerator';
import { sendEmail, emailTrabajoRechazado } from '@/lib/email';

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

        const { trabajoId } = await request.json();

        // Obtener el trabajo con todas sus relaciones
        const trabajo = await prisma.trabajos.findUnique({
            where: { id: trabajoId },
            include: {
                usuario: true,
                convocatoria: true,
                asignaciones: true
            }
        });

        if (!trabajo) {
            return NextResponse.json(
                { error: 'Trabajo no encontrado' },
                { status: 404 }
            );
        }

        // Validación: Debe existir nivel de plagio e IA
        if (trabajo.nvl_ia === null || trabajo.nvl_plagio === null) {
            return NextResponse.json(
                { error: 'El trabajo debe tener niveles de IA y plagio registrados' },
                { status: 400 }
            );
        }

        let promedioFinal = 0;
        let motivo = '';
        let caso = 2; // Por defecto caso 2

        // Determinar el caso
        if (trabajo.asignaciones.length > 0) {
            // Caso 1: Tiene asignaciones
            caso = 1;

            // Validar que todas estén calificadas
            const asignacionesSinCalificar = trabajo.asignaciones.filter(
                asig => asig.calificacion === null
            );

            if (asignacionesSinCalificar.length > 0) {
                return NextResponse.json(
                    { error: 'Todas las asignaciones deben estar calificadas antes de rechazar el trabajo' },
                    { status: 400 }
                );
            }

            // Calcular promedio
            const calificaciones = trabajo.asignaciones.map(asig => asig.calificacion);
            const promedio = calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length;
            promedioFinal = parseFloat(promedio.toFixed(2));
            motivo = 'El trabajo no cumplió con los estándares de calidad requeridos según la evaluación de los revisores';
        } else {
            // Caso 2: No tiene asignaciones (niveles altos de IA/plagio)
            promedioFinal = 0;
            motivo = 'El trabajo presenta niveles elevados de IA y/o plagio que impiden su evaluación';
        }

        // Actualizar trabajo
        await prisma.trabajos.update({
            where: { id: trabajoId },
            data: {
                estado: 'RECHAZADO',
                calificacion_final: promedioFinal
            }
        });

        // Preparar datos para el PDF
        const nombreCompleto = `${trabajo.usuario.nombre} ${trabajo.usuario.apellidoP} ${trabajo.usuario.apellidoM}`;
        const autores = trabajo.coautores.length > 0
            ? trabajo.coautores.join(', ')
            : 'Sin coautores';
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
            calificacion: caso === 1 ? promedioFinal : null,
            motivo,
            fecha,
            anio,
            comentarios 
        };

        const pdfBuffer = await generarDictamenPDF('RECHAZADO', datosPDF);

        const { html, text } = emailTrabajoRechazado({
            nombreCompleto,
            titulo: trabajo.titulo,
            motivo,
            calificacion: caso === 1 ? promedioFinal : null,
            anio
        });

        const emailResult = await sendEmail({
            to: trabajo.usuario.email,
            subject: `CIIDiCI ${anio} - Resultado de Evaluación: ${trabajo.titulo}`,
            html,
            text,
            attachments: [
                {
                    filename: `Dictamen_Rechazo_${trabajoId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        if (!emailResult.success) {
            console.error('Error al enviar email:', emailResult.error);
        }

        return NextResponse.json({
            message: 'Trabajo rechazado exitosamente',
            trabajo: {
                id: trabajo.id,
                titulo: trabajo.titulo,
                estado: 'RECHAZADO',
                calificacion_final: promedioFinal,
                caso
            },
            emailSent: emailResult.success
        });

    } catch (error) {
        console.error('Error al rechazar trabajo:', error);
        return NextResponse.json(
            { error: 'Error al rechazar trabajo' },
            { status: 500 }
        );
    }
}