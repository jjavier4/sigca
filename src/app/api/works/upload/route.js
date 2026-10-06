import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { emailPropuestaRecibida, sendEmail } from '@/lib/email';
import { saveFile,deleteFile } from '@/lib/storage'
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado. Debes iniciar sesión' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const dataConvocatoria = formData.get('dataConvocatoria');
        const dataConvocatoriaParsed = JSON.parse(dataConvocatoria);
        const file = formData.get('file');
        const convocatoriaId = formData.get('convocatoriaId');
        const userId = formData.get('userId');
        console.log('dataConvocatoria:', dataConvocatoria);
        // Validaciones
        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó ningún archivo' },
                { status: 400 }
            );
        }

        if (!convocatoriaId || !userId) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos (convocatoriaId o userId)' },
                { status: 400 }
            );
        }
        if (!dataConvocatoriaParsed) {
            return NextResponse.json(
                { error: 'Faltan datos de registro' },
                { status: 400 }
            );
        }
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
                { error: 'La convocatoria no está abierta para recibir propuestas' },
                { status: 400 }
            );
        }

        // Verificar si el usuario ya tiene un trabajo enviado para esta convocatoria
        const trabajoExistente = await prisma.trabajos.findFirst({
            where: {
                convocatoriaId: convocatoriaId,
                usuarioId: userId
            }
        });

        if (trabajoExistente) {
            return NextResponse.json(
                { error: 'Ya has enviado una propuesta para esta convocatoria' },
                { status: 400 }
            );
        }

        const fileName = `${convocatoriaId}.pdf`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await saveFile(userId, fileName, buffer);

        const relativePath = `/uploads/users_files/${userId}/${fileName}`;

        async function generarTrabajoId() {
            try {
                const result = await prisma.$queryRaw`
                SELECT generar_trabajo_id() as id
                `;
                return result[0].id;
            } catch (error) {
                console.error('Error al generar ID:', error);
                throw new Error('No se pudo generar el ID del trabajo');
            }
        }

        const trabajoData = {
            id: await generarTrabajoId(),
            titulo: dataConvocatoriaParsed.tituloPropuesta,
            tipo: dataConvocatoriaParsed.tipo,
            coautores: {
                create: dataConvocatoriaParsed.coautores || []
            },
            convocatoriaId: convocatoriaId,
            usuarioId: userId,
            archivo_url: relativePath
        }
        const trabajo = await prisma.trabajos.create({
            data: trabajoData
        });

        // Enviar correo de confirmación a todos los autores
        const { html, text } = emailPropuestaRecibida({
            nombreAutor: session.user.name,
            tituloTrabajo: trabajo.titulo,
        });

        const emailResult = await sendEmail({
            to: session.user.email,
            subject: `Propuesta Recibida - ${trabajo.estado}`,
            html,
            text,
        });


        return NextResponse.json(
            {
                message: 'Propuesta enviada exitosamente',
                trabajo: trabajo
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error al subir archivo:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}