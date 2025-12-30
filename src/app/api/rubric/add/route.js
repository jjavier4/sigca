// src/app/api/rubricas/add/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

   
    const body = await request.json();
    const { nombre, descripcion, grupo, descripcion_puntaje } = body;

    // Validaciones
    if (!nombre || !descripcion || !grupo) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Validar que grupo sea válido
    if (!['DIFUSION', 'DIVULGACION'].includes(grupo)) {
      return NextResponse.json(
        { error: 'Grupo inválido. Debe ser DIFUSION o DIVULGACION' },
        { status: 400 }
      );
    }

    // Validar que descripcion_puntaje sea un array de 4 elementos
    if (!Array.isArray(descripcion_puntaje) || descripcion_puntaje.length !== 4) {
      return NextResponse.json(
        { error: 'descripcion_puntaje debe ser un array de 4 elementos (10, 8, 6, 0 puntos)' },
        { status: 400 }
      );
    }

    // Validar que todos los elementos del array tengan contenido
    if (descripcion_puntaje.some(desc => !desc || desc.trim() === '')) {
      return NextResponse.json(
        { error: 'Todas las descripciones de puntaje son obligatorias' },
        { status: 400 }
      );
    }

    // Crear el criterio
    const nuevoCriterio = await prisma.criteriosEvaluacion.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        grupo,
        descripcion_puntaje: descripcion_puntaje.map(desc => desc.trim())
      }
    });

    return NextResponse.json(nuevoCriterio, { status: 201 });

  } catch (error) {
    console.error('Error al crear criterio:', error);
    return NextResponse.json(
      { error: 'Error al crear criterio de evaluación' },
      { status: 500 }
    );
  }
}