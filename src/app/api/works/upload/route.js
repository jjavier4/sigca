import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const session = await getServerSession();

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

        // 1. Crear directorio en public/documents/userId
        const publicPath = path.join(process.cwd(), 'public');
        const documentsPath = path.join(publicPath, 'documents');
        const userDirectoryPath = path.join(documentsPath, userId);

        // Crear carpeta 'documents' si no existe
        if (!existsSync(documentsPath)) {
            await mkdir(documentsPath, { recursive: true });
        }

        // Crear carpeta del usuario si no existe
        if (!existsSync(userDirectoryPath)) {
            await mkdir(userDirectoryPath, { recursive: true });
        }

        // 2. Nombrar el archivo con el ID de la convocatoria
        const fileName = `${convocatoriaId}.pdf`;
        const filePath = path.join(userDirectoryPath, fileName);

        // Convertir el archivo a buffer y guardarlo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 3. Crear registro en la tabla trabajos
        const relativePath = `/documents/${userId}/${fileName}`;
        // 4. Unir auores con comas
        const coautoresString = dataConvocatoriaParsed.coautores.join(', ');
        const trabajo = await prisma.trabajos.create({
            data: {
                titulo : dataConvocatoriaParsed.tituloPropuesta,
                tipo : dataConvocatoriaParsed.tipo,
                coautores : coautoresString,
                convocatoriaId: convocatoriaId,
                usuarioId: userId,  
                archivo_url: relativePath,
                estado: "EN_REVISION",  
                version: 1
            }
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