import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { emailPropuestaRecibida, sendEmail } from '@/lib/email';
import { saveFile, deleteFile } from '@/lib/storage'
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado. Debes iniciar sesión' },
                { status: 401 }
            );
        }

        const formData = await request.formData()
        const dataConvocatoria = formData.get('dataConvocatoria')
        const dataConvocatoriaParsed = JSON.parse(dataConvocatoria)
        const file = formData.get('file');
        const trabajoId = formData.get('trabajoId');
        const userId = session.user.id;
        const convocatoriaId = formData.get('convocatoriaId')

        if (!dataConvocatoriaParsed) {
            return NextResponse.json(
                { error: 'Faltan datos de registro' },
                { status: 400 }
            );
        }
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

            const fileName = `${convocatoriaId}.pdf`;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            deleteFile(userId, fileName); // Eliminar el archivo anterior si existe
            await saveFile(userId, fileName, buffer);

        }


        const oldCoauthors = dataConvocatoriaParsed.coautores.filter(coautor => coautor.id && coautor.update === true); // Coautores existentes
        const newCoauthors = dataConvocatoriaParsed.coautores.filter(coautor => !coautor.id); // Nuevos coautores

        await prisma.$transaction(async (tx) => {
            await Promise.all(
                oldCoauthors.map(item =>
                    tx.coautores.update({
                        where: { id: item.id },
                        data: { nombre: item.nombre, email: item.email }
                    })
                )
            );
        });
        const trabajoData = {
            titulo: dataConvocatoriaParsed.tituloPropuesta,
            tipo: dataConvocatoriaParsed.tipo,
            coautores: {
                create: newCoauthors || []
            }
        }


        const trabajo = await prisma.trabajos.update({
            where: { id: trabajoId },
            data: trabajoData
        });


        return NextResponse.json(
            {
                message: 'Propuesta actualizada exitosamente',
                trabajo: trabajo
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al subir archivo:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}