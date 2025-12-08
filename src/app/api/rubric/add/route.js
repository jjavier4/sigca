// src/app/api/rubricas/add/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, descripcion } = body;

    // Validaciones
    if (!nombre || !descripcion) {
      return Response.json(
        { error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      );
    }

    if (nombre.trim().length < 3) {
      return Response.json(
        { error: 'El nombre debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (descripcion.trim().length < 10) {
      return Response.json(
        { error: 'La descripción debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Crear la rúbrica (por defecto estado = false)
    const nuevaRubrica = await prisma.rubrica.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estado: false
      }
    });

    return Response.json({
      success: true,
      message: 'Criterio de evaluación creado exitosamente',
      data: nuevaRubrica
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear rúbrica:', error);
    return Response.json(
      { error: 'Error al crear rúbrica' },
      { status: 500 }
    );
  }
}