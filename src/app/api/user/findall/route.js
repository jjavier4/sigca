import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';

export async function GET(request) {
  try {
    const { error } = await authorize(['ADMIN', 'COMITE']);
    if (error) return error;

    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        // No incluir password por seguridad
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(
      { 
        success: true,
        count: usuarios.length,
        usuarios 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}