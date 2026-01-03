// src/app/api/trabajos/analisis/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/db';


export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo COMITE y ADMIN pueden actualizar
    if (session.user.rol !== 'COMITE' && session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { trabajoId, nvl_ia, nvl_plagio } = body;

    // Validaciones
    if (!trabajoId) {
      return NextResponse.json(
        { error: 'ID del trabajo es obligatorio' },
        { status: 400 }
      );
    }

    if (nvl_ia === null || nvl_ia === undefined) {
      return NextResponse.json(
        { error: 'El nivel de IA es obligatorio' },
        { status: 400 }
      );
    }

    if (nvl_plagio === null || nvl_plagio === undefined) {
      return NextResponse.json(
        { error: 'El nivel de plagio es obligatorio' },
        { status: 400 }
      );
    }

    // Validar que sean números válidos entre 0 y 100
    if (typeof nvl_ia !== 'number' || nvl_ia < 0 || nvl_ia > 100) {
      return NextResponse.json(
        { error: 'El nivel de IA debe ser un número entre 0 y 100' },
        { status: 400 }
      );
    }

    if (typeof nvl_plagio !== 'number' || nvl_plagio < 0 || nvl_plagio > 100) {
      return NextResponse.json(
        { error: 'El nivel de plagio debe ser un número entre 0 y 100' },
        { status: 400 }
      );
    }

    // Verificar que el trabajo existe
    const trabajoExistente = await prisma.trabajos.findUnique({
      where: { id: trabajoId },
      select: {
        id: true,
        titulo: true,
      }
    });

    if (!trabajoExistente) {
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
        updatedAt: new Date()
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