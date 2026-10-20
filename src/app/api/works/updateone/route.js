import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';
import { saveFile, deleteFile, esPdf } from '@/lib/storage'

export async function POST(request) {
    try {
        const { session, error } = await authorize();
        if (error) return error;

        const formData = await request.formData()
        const file = formData.get('file');
        const trabajoId = formData.get('trabajoId');
        const userId = session.user.id;

        let dataConvocatoriaParsed;
        try {
            dataConvocatoriaParsed = JSON.parse(formData.get('dataConvocatoria'))
        } catch {
            dataConvocatoriaParsed = null;
        }

        if (!dataConvocatoriaParsed || !trabajoId) {
            return NextResponse.json(
                { error: 'Faltan datos de registro' },
                { status: 400 }
            );
        }

        // Solo el dueño del trabajo puede editarlo
        const trabajoActual = await prisma.trabajos.findFirst({
            where: { id: trabajoId, usuarioId: userId },
            select: { convocatoriaId: true }
        });

        if (!trabajoActual) {
            return NextResponse.json(
                { error: 'Trabajo no encontrado' },
                { status: 404 }
            );
        }

        // La convocatoria sale del trabajo guardado, no del cliente
        const convocatoriaId = trabajoActual.convocatoriaId;

        // Verificar que la convocatoria existe y está abierta
        const convocatoria = await prisma.convocatorias.findUnique({
            where: { id: convocatoriaId }
        });

        if (!convocatoria) {
            return NextResponse.json(
                { error: 'La convocatoria no existe' },
                { status: 404 }
            );
        }

        const now = new Date();
        if (now < convocatoria.fecha_inicio || now > convocatoria.fecha_cierre) {
            return NextResponse.json(
                { error: 'La convocatoria no está abierta para recibir actualizaciones' },
                { status: 400 }
            );
        }

        let buffer = null;
        if (file instanceof File) {
            // Validar que el archivo sea PDF
            if (!file.name.endsWith('.pdf')) {
                return NextResponse.json(
                    { error: 'Solo se permiten archivos PDF' },
                    { status: 400 }
                );
            }

            // Validar tamaño del archivo (10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: 'El archivo excede el tamaño máximo permitido (10MB)' },
                    { status: 400 }
                );
            }

            buffer = Buffer.from(await file.arrayBuffer());
            if (!esPdf(buffer)) {
                return NextResponse.json(
                    { error: 'El archivo no es un PDF válido' },
                    { status: 400 }
                );
            }
        }

        if (buffer) {
            const fileName = `${convocatoriaId}.pdf`;
            await deleteFile(userId, fileName); // Eliminar el archivo anterior si existe
            await saveFile(userId, fileName, buffer);
        }

        // Solo se aceptan nombre y email de los coautores que manda el cliente
        const coautores = Array.isArray(dataConvocatoriaParsed.coautores) ? dataConvocatoriaParsed.coautores : [];
        const oldCoauthors = coautores.filter(coautor => coautor.id && coautor.update === true); // Coautores existentes
        const newCoauthors = coautores
            .filter(coautor => !coautor.id) // Nuevos coautores
            .map(coautor => ({
                nombre: String(coautor.nombre ?? '').trim(),
                email: String(coautor.email ?? '').trim().toLowerCase(),
            }));

        const trabajo = await prisma.$transaction(async (tx) => {
            for (const item of oldCoauthors) {
                // idTrabajo en el where evita editar coautores de otros trabajos
                await tx.coautores.updateMany({
                    where: { id: item.id, idTrabajo: trabajoId },
                    data: {
                        nombre: String(item.nombre ?? '').trim(),
                        email: String(item.email ?? '').trim().toLowerCase(),
                    }
                });
            }

            return tx.trabajos.update({
                where: { id: trabajoId },
                data: {
                    titulo: dataConvocatoriaParsed.tituloPropuesta,
                    tipo: dataConvocatoriaParsed.tipo,
                    coautores: {
                        create: newCoauthors
                    }
                }
            });
        });

        return NextResponse.json(
            {
                message: 'Propuesta actualizada exitosamente',
                trabajo: trabajo
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al actualizar propuesta:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}
