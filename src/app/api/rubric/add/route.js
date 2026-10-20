// src/app/api/rubricas/add/route.js
import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { validar, crearCriterioSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

    const { data, error: errorValidacion } = validar(crearCriterioSchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { nombre, descripcion, grupo, descripcion_puntaje } = data;

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