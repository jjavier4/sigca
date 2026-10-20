// src/app/api/trabajos/analisis/route.js

import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { validar, analisisIASchema } from '@/lib/validation';
import {prisma} from '@/lib/db';


export async function PATCH(request) {
  try {
    // Solo COMITE y ADMIN pueden actualizar
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

    const { data, error: errorValidacion } = validar(analisisIASchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { trabajoId, nvl_ia, nvl_plagio } = data;

    // Verificar que el trabajo existe
    const trabajoExistente = await prisma.trabajos.findUnique({
      where: { id: trabajoId },
      select: {
        id: true,
        titulo: true,
        convocatoria: { select: { activa: true } },
      }
    });

    if (!trabajoExistente || !trabajoExistente.convocatoria.activa) {
      return NextResponse.json(
        { error: 'Trabajo no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el trabajo con los nuevos valores
    const trabajoActualizado = await prisma.trabajos.update({
      where: { id: trabajoId },
      data: {
        nvl_ia: parseFloat(nvl_ia),
        nvl_plagio: parseFloat(nvl_plagio),
        updatedAt: new Date(),
        estado: 'EN_REVISION' 
      },
      include: {
        convocatoria: {
          select: {
            titulo: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Análisis registrado exitosamente',
        trabajo: {
          id: trabajoActualizado.id,
          titulo: trabajoActualizado.titulo,
          nvl_ia: trabajoActualizado.nvl_ia,
          nvl_plagio: trabajoActualizado.nvl_plagio,
          convocatoria: trabajoActualizado.convocatoria.titulo
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar análisis:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Trabajo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el análisis' },
      { status: 500 }
    );
  }
}