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

    // Obtener email del query string (ej: ?email=usuario@ejemplo.com)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Debe proporcionar un email. Ejemplo: ?email=usuario@ejemplo.com' },
        { status: 400 }
      );
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Solo ADMIN, COMITE o el mismo usuario pueden ver el perfil
    const esAdmin = session.user.rol === 'ADMIN';
    const esComite = session.user.rol === 'COMITE';
    const esMismoUsuario = session.user.email === email;

    if (!esAdmin && !esComite && !esMismoUsuario) {
      return NextResponse.json(
        { error: 'No autorizado para ver este usuario' },
        { status: 403 }
      );
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        usuario 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario', details: error.message },
      { status: 500 }
    );
  }
}