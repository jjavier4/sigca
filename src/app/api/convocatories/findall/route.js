import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (session.user.rol !== 'ADMIN' || session.user.rol !== 'COMITE') {
      return NextResponse.json(
        { error: 'No autorizado para ver usuarios' },
        { status: 403 }
      );
    }

    const usuarios = await prisma.usuario.findMany({
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
      { error: 'Error al obtener usuarios', details: error.message },
      { status: 500 }
    );
  }
}